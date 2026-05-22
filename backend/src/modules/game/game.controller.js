const gameService = require('./game.service')
const { checkWin } = require('./WinDetection')
const {
  CreateGameDTO,
  MakeMoveDTO,
  JoinGameDTO,
  GameDetailResponseDTO,
  MoveResponseDTO,
  GameHistoryListDTO,
  GameStatsDTO,
  WaitingGamesListDTO,
  SuccessResponseDTO,
  ErrorResponseDTO,
} = require('./game.dto')
const {
  asyncHandler,
  resolveUserId,
  resolveExistingRequestUserId,
  buildGuestUser,
  normalizeParticipants,
  buildPlayerX,
  buildAIPlayerO,
  buildHumanPlayerO,
  formatActiveGame,
  formatListedGame,
} = require('./game.controller.helpers')

const createGame = asyncHandler(async (req, res) => {
  const currentUser = req.user || buildGuestUser()
  const createGameDTO = new CreateGameDTO(req.body)
  createGameDTO.validate()

  const { gameMode, boardSize, timeControl, opponentType, aiDifficulty } = createGameDTO
  const requestedPlayerX = req.body?.playerX || {}
  const requestedPlayerO = req.body?.playerO || {}
  const playerXIsAI = Boolean(requestedPlayerX?.isAI)
  let playerOIsAI = Boolean(requestedPlayerO?.isAI)

  if (opponentType === 'ai' && !playerXIsAI && !playerOIsAI) playerOIsAI = true

  if (playerXIsAI && playerOIsAI) {
    return res.status(400).json(new ErrorResponseDTO('Only one AI player is supported in singleplayer games', 400).toJSON())
  }

  const playerX = buildPlayerX({ requestedPlayerX, playerXIsAI, currentUser, aiDifficulty })

  let playerO
  if (playerOIsAI) {
    playerO = buildAIPlayerO(requestedPlayerO, aiDifficulty)
  } else if (opponentType === 'human' || (opponentType === 'ai' && playerXIsAI)) {
    playerO = buildHumanPlayerO(requestedPlayerO)
  } else {
    return res.status(400).json(new ErrorResponseDTO('Invalid opponent type. Must be "ai" or "human"', 400).toJSON())
  }

  const game = await gameService.createNewGame({
    gameMode: gameMode || 'singleplayer',
    boardSize: boardSize || 15,
    timeControl: timeControl || 60,
    playerX,
    playerO,
    participants: normalizeParticipants(req.body?.participants),
  })

  res.status(201).json(new SuccessResponseDTO({
    gameId: game.gameId,
    boardSize: game.boardSize,
    gameMode: game.gameMode,
    status: game.status,
    currentTurn: game.currentTurn,
    opponentType,
    aiDifficulty: opponentType === 'ai' ? aiDifficulty : null,
    players: {
      X: { name: game.players.X.playerName, isAI: game.players.X.isAI, rank: game.players.X.playerRank },
      O: {
        name: game.players.O.playerName,
        isAI: game.players.O.isAI,
        rank: game.players.O.playerRank,
        aiDifficulty: game.players.O.aiDifficulty,
      },
    },
  }).toJSON())
})

const createLocalHistory = asyncHandler(async (req, res) => {
  const { boardSize, timeControl, participants, winner, winningTiles, totalMoves, startedAt, moves, status } = req.body || {}

  const game = await gameService.createCompletedLocalGame({
    boardSize,
    timeControl,
    participants: normalizeParticipants(participants),
    winner,
    winningTiles,
    totalMoves,
    startedAt,
    moves,
    status,
  })

  res.status(201).json(new SuccessResponseDTO({
    gameId: game.gameId,
    boardSize: game.boardSize,
    status: game.status,
    result: game.result,
    participants: game.participants,
  }, 'Local game saved to history').toJSON())
})

const getGame = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const currentUserId = resolveUserId(req.user)
  const game = await gameService.getGameById(gameId)

  if (currentUserId) {
    const isPlayerX = String(game.players.X.playerId) === String(currentUserId)
    const isPlayerO = String(game.players.O.playerId) === String(currentUserId)
    const isSpectator = game.gameMode === 'multiplayer' && !isPlayerX && !isPlayerO

    if (!isPlayerX && !isPlayerO && !isSpectator && game.gameMode !== 'local') {
      return res.status(403).json(new ErrorResponseDTO('Not authorized to view this game', 403).toJSON())
    }
  }

  res.status(200).json(new SuccessResponseDTO(new GameDetailResponseDTO(game, currentUserId).toJSON()).toJSON())
})

const getGames = asyncHandler(async (req, res) => {
  const games = await gameService.getGames(req.query.limit)
  res.status(200).json(new SuccessResponseDTO({ games: games.map(formatListedGame) }).toJSON())
})

const makeMove = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const makeMoveDTO = new MakeMoveDTO(req.body)
  const game = await gameService.getGameById(gameId)
  makeMoveDTO.validate(game.boardSize)

  const currentTurnPlayer = game.players[game.currentTurn]
  const resolvedPlayerId = resolveUserId(req.user) || (currentTurnPlayer?.isAI ? null : currentTurnPlayer?.playerId)

  if (!resolvedPlayerId) {
    return res.status(400).json(new ErrorResponseDTO('AI moves must be requested through the AI endpoint', 400).toJSON())
  }

  const result = await gameService.makeMove(
    gameId, resolvedPlayerId, makeMoveDTO.row, makeMoveDTO.col, makeMoveDTO.timeTaken, checkWin
  )

  res.status(200).json(new SuccessResponseDTO(new MoveResponseDTO(result.move, result.game).toJSON()).toJSON())
})

const makeAIMove = asyncHandler(async (req, res) => {
  const result = await gameService.makeAIMove(req.params.gameId)
  res.status(200).json(new SuccessResponseDTO(new MoveResponseDTO(result.move, result.game).toJSON()).toJSON())
})

const skipTurn = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const game = await gameService.getGameById(gameId)
  const currentTurnPlayer = game.players[game.currentTurn]
  const resolvedPlayerId = resolveUserId(req.user) || currentTurnPlayer?.playerId
  const timeTaken = Math.max(0, Number(req.body?.timeTaken) || 0)
  const expectedTurn = typeof req.body?.player === 'string' ? req.body.player : null

  const result = await gameService.skipTurn(gameId, resolvedPlayerId, expectedTurn, timeTaken)

  res.status(200).json(new SuccessResponseDTO({
    gameId: result.game.gameId,
    skippedPlayer: result.skippedPlayer,
    currentTurn: result.currentTurn,
    timeTaken: result.timeTaken,
    status: result.game.status,
  }, 'Turn skipped').toJSON())
})

const joinGame = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const currentUser = req.user || buildGuestUser()
  new JoinGameDTO({ gameId }).validate()

  const game = await gameService.joinGame(gameId, {
    playerId: currentUser.userId || currentUser.id,
    playerName: currentUser.username,
    playerRank: currentUser.rank || 1200,
  })

  res.status(200).json(new SuccessResponseDTO({
    gameId: game.gameId,
    boardSize: game.boardSize,
    currentTurn: game.currentTurn,
    players: {
      X: { name: game.players.X.playerName, rank: game.players.X.playerRank },
      O: { name: game.players.O.playerName, rank: game.players.O.playerRank },
    },
  }, 'Successfully joined game').toJSON())
})

const getGameHistory = asyncHandler(async (req, res) => {
  const currentUserId = await resolveExistingRequestUserId(req)
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 20

  if (!currentUserId) {
    return res.status(200).json(new SuccessResponseDTO({
      games: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    }).toJSON())
  }

  const history = await gameService.getPlayerHistory(currentUserId, page, limit, {
    search: req.query.search,
    result: req.query.result,
    gameType: req.query.gameType,
    playerCount: req.query.playerCount,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    sort: req.query.sort,
  })
  res.status(200).json(new SuccessResponseDTO(
    new GameHistoryListDTO(history.games, currentUserId, history.pagination).toJSON()
  ).toJSON())
})

const getWaitingGames = asyncHandler(async (req, res) => {
  const currentUserId = resolveUserId(req.user)
  const boardSize = req.query.boardSize ? parseInt(req.query.boardSize, 10) : null
  const games = await gameService.getWaitingGames(currentUserId, boardSize)
  res.status(200).json(new SuccessResponseDTO(new WaitingGamesListDTO(games).toJSON()).toJSON())
})

const getGameReplay = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const currentUserId = resolveUserId(req.user)
  const replay = await gameService.getGameReplay(gameId)

  if (currentUserId) {
    const isPlayerX = String(replay.players.X.playerId) === String(currentUserId)
    const isPlayerO = String(replay.players.O.playerId) === String(currentUserId)
    const isParticipant = Array.isArray(replay.participants)
      && replay.participants.some((participant) => String(participant?.playerId) === String(currentUserId))

    if (!isPlayerX && !isPlayerO && !isParticipant && replay.gameInfo.gameMode !== 'local') {
      return res.status(403).json(new ErrorResponseDTO('Not authorized to view this replay', 403).toJSON())
    }
  }

  res.status(200).json(new SuccessResponseDTO(replay).toJSON())
})

const getGameStats = asyncHandler(async (req, res) => {
  const currentUserId = resolveUserId(req.user)
  if (!currentUserId) {
    return res.status(200).json(new SuccessResponseDTO(new GameStatsDTO({
      total: 0, wins: 0, losses: 0, draws: 0, winRate: 0,
    }).toJSON()).toJSON())
  }
  const stats = await gameService.getPlayerGameStats(currentUserId)
  res.status(200).json(new SuccessResponseDTO(new GameStatsDTO(stats).toJSON()).toJSON())
})

const resignGame = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const game = await gameService.getGameById(gameId)
  const currentUserId = resolveUserId(req.user) || game.players[game.currentTurn]?.playerId
  const resignedGame = await gameService.resignGame(gameId, currentUserId)

  res.status(200).json(new SuccessResponseDTO({
    winner: resignedGame.result.winner,
    winReason: resignedGame.result.winReason,
  }, `Player resigned. ${resignedGame.result.winner} wins!`).toJSON())
})

const abortGame = asyncHandler(async (req, res) => {
  const persistFlag = req.body?.persist
  const persist = persistFlag === undefined ? true : Boolean(persistFlag)
  const reason = typeof req.body?.reason === 'string' ? req.body.reason : 'resignation'
  const result = await gameService.abortGame(req.params.gameId, { persist, reason })
  const message = result.abandoned ? 'Game saved as abandoned'
    : result.deleted ? 'Game aborted and removed'
    : result.alreadyCompleted ? 'Game already completed; not removed'
    : 'Game not found'
  res.status(200).json(new SuccessResponseDTO(result, message).toJSON())
})

// Admin-only route — auth + authorizeAdmin middleware guards it upstream.
const deleteGame = asyncHandler(async (req, res) => {
  await gameService.deleteGame(req.params.gameId)
  res.status(200).json(new SuccessResponseDTO(null, 'Game deleted successfully').toJSON())
})

const cleanupGames = asyncHandler(async (req, res) => {
  const result = await gameService.cleanupAbandonedGames(60)
  res.status(200).json(new SuccessResponseDTO(result, `Cleaned up ${result.cleanedCount} abandoned games`).toJSON())
})

const getActiveGames = asyncHandler(async (req, res) => {
  const currentUserId = resolveUserId(req.user)
  if (!currentUserId) return res.status(200).json(new SuccessResponseDTO([]).toJSON())

  const games = await gameService.getActiveGamesForPlayer(currentUserId)
  res.status(200).json(new SuccessResponseDTO(
    games.map((game) => formatActiveGame(game, currentUserId))
  ).toJSON())
})

module.exports = {
  createGame,
  createLocalHistory,
  getGames,
  getGame,
  getActiveGames,
  getGameHistory,
  getWaitingGames,
  joinGame,
  makeMove,
  makeAIMove,
  skipTurn,
  resignGame,
  abortGame,
  getGameReplay,
  deleteGame,
  cleanupGames,
  getGameStats,
}
