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

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const resolveUserId = (user) => user?.userId || user?.id || null

const buildGuestUser = () => {
  const guestId = `guest_${Date.now()}`
  return {
    id: guestId,
    userId: guestId,
    username: 'Guest Player',
    rank: 1200,
    isAdmin: false,
  }
}

const normalizeParticipants = (participants = []) => (
  Array.isArray(participants)
    ? participants
      .filter((participant) => participant && participant.playerName)
      .map((participant, index) => ({
        playerId: participant.playerId || participant.id || null,
        playerName: participant.playerName || participant.name || `Player ${index + 1}`,
        avatar: participant.avatar || '',
        playerSymbol: participant.playerSymbol || participant.symbol || participant.token || '',
        marker: participant.marker || participant.playerSymbol || participant.symbol || participant.token || '',
        order: Number(participant.order) || index + 1,
        isAI: Boolean(participant.isAI),
        aiDifficulty: participant.isAI ? (participant.aiDifficulty || null) : null,
      }))
    : []
)

const createGame = asyncHandler(async (req, res) => {
  const currentUser = req.user || buildGuestUser()
  const createGameDTO = new CreateGameDTO(req.body)
  createGameDTO.validate()

  const { gameMode, boardSize, timeControl, opponentType, aiDifficulty } = createGameDTO

  const requestedPlayerX = req.body?.playerX || {}
  const requestedPlayerO = req.body?.playerO || {}
  const playerXIsAI = Boolean(requestedPlayerX?.isAI)
  let playerOIsAI = Boolean(requestedPlayerO?.isAI)

  if (opponentType === 'ai' && !playerXIsAI && !playerOIsAI) {
    playerOIsAI = true
  }

  if (playerXIsAI && playerOIsAI) {
    return res.status(400).json(new ErrorResponseDTO('Only one AI player is supported in singleplayer games', 400).toJSON())
  }

  const resolveAIRank = (difficulty) => (
    difficulty === 'easy' ? 1000 : difficulty === 'hard' ? 1400 : 1200
  )

  const playerX = {
    playerId: requestedPlayerX.playerId || (playerXIsAI ? `ai_${Date.now()}_x` : currentUser.userId || currentUser.id),
    playerName: requestedPlayerX.playerName || (playerXIsAI ? `AI (${requestedPlayerX.aiDifficulty || aiDifficulty || 'medium'})` : currentUser.name || currentUser.username),
    avatar: requestedPlayerX.avatar || '',
    playerRank: requestedPlayerX.playerRank || (playerXIsAI ? resolveAIRank(requestedPlayerX.aiDifficulty || aiDifficulty || 'medium') : currentUser.rank || 1200),
    isAI: playerXIsAI,
    aiDifficulty: playerXIsAI ? (requestedPlayerX.aiDifficulty || aiDifficulty || 'medium') : null,
  }

  let playerO

  if (playerOIsAI) {
    playerO = {
      playerId: requestedPlayerO.playerId || `ai_${Date.now()}_o`,
      playerName: requestedPlayerO.playerName || `AI (${requestedPlayerO.aiDifficulty || aiDifficulty || 'medium'})`,
      avatar: requestedPlayerO.avatar || '',
      playerRank: requestedPlayerO.playerRank || resolveAIRank(requestedPlayerO.aiDifficulty || aiDifficulty || 'medium'),
      isAI: true,
      aiDifficulty: requestedPlayerO.aiDifficulty || aiDifficulty || 'medium',
    }
  } else if (opponentType === 'human' || (opponentType === 'ai' && playerXIsAI)) {
    playerO = {
      playerId: requestedPlayerO.playerId || 'local_player_2',
      playerName: requestedPlayerO.playerName || 'Player 2',
      avatar: requestedPlayerO.avatar || '',
      playerRank: requestedPlayerO.playerRank || 1200,
      isAI: false,
      aiDifficulty: null,
    }
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

  const responseDTO = new SuccessResponseDTO({
    gameId: game.gameId,
    boardSize: game.boardSize,
    gameMode: game.gameMode,
    status: game.status,
    currentTurn: game.currentTurn,
    opponentType,
    aiDifficulty: opponentType === 'ai' ? aiDifficulty : null,
    players: {
      X: {
        name: game.players.X.playerName,
        isAI: game.players.X.isAI,
        rank: game.players.X.playerRank,
      },
      O: {
        name: game.players.O.playerName,
        isAI: game.players.O.isAI,
        rank: game.players.O.playerRank,
        aiDifficulty: game.players.O.aiDifficulty,
      },
    },
  })

  res.status(201).json(responseDTO.toJSON())
})

const createLocalHistory = asyncHandler(async (req, res) => {
  const {
    boardSize,
    timeControl,
    participants,
    winner,
    winningTiles,
    totalMoves,
    startedAt,
  } = req.body || {}

  const game = await gameService.createCompletedLocalGame({
    boardSize,
    timeControl,
    participants: normalizeParticipants(participants),
    winner,
    winningTiles,
    totalMoves,
    startedAt,
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

  const gameDetailDTO = new GameDetailResponseDTO(game, currentUserId)
  res.status(200).json(new SuccessResponseDTO(gameDetailDTO.toJSON()).toJSON())
})

const getGames = asyncHandler(async (req, res) => {
  const games = await gameService.getGames(req.query.limit)

  res.status(200).json(new SuccessResponseDTO({
    games: games.map((game) => ({
      gameId: game.gameId,
      boardSize: game.boardSize,
      gameMode: game.gameMode,
      status: game.status,
      currentTurn: game.currentTurn,
      result: game.result,
      participants: Array.isArray(game.participants) ? game.participants : [],
      startedAt: game.startedAt,
      completedAt: game.completedAt,
      totalMoves: game.result?.totalMoves ?? game.moves?.length ?? 0,
    })),
  }).toJSON())
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
    gameId,
    resolvedPlayerId,
    makeMoveDTO.row,
    makeMoveDTO.col,
    makeMoveDTO.timeTaken,
    checkWin
  )

  res.status(200).json(new SuccessResponseDTO(new MoveResponseDTO(result.move, result.game).toJSON()).toJSON())
})

const makeAIMove = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const result = await gameService.makeAIMove(gameId)
  res.status(200).json(new SuccessResponseDTO(new MoveResponseDTO(result.move, result.game).toJSON()).toJSON())
})

const joinGame = asyncHandler(async (req, res) => {
  const { gameId } = req.params
  const currentUser = req.user || buildGuestUser()
  const joinGameDTO = new JoinGameDTO({ gameId })
  joinGameDTO.validate()

  const playerO = {
    playerId: currentUser.userId || currentUser.id,
    playerName: currentUser.username,
    playerRank: currentUser.rank || 1200,
  }

  const game = await gameService.joinGame(gameId, playerO)

  res.status(200).json(new SuccessResponseDTO({
    gameId: game.gameId,
    boardSize: game.boardSize,
    currentTurn: game.currentTurn,
    players: {
      X: {
        name: game.players.X.playerName,
        rank: game.players.X.playerRank,
      },
      O: {
        name: game.players.O.playerName,
        rank: game.players.O.playerRank,
      },
    },
  }, 'Successfully joined game').toJSON())
})

const getGameHistory = asyncHandler(async (req, res) => {
  const currentUserId = resolveUserId(req.user) || req.query.userId || null
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 20

  if (!currentUserId) {
    return res.status(200).json(new SuccessResponseDTO({
      games: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    }).toJSON())
  }

  const history = await gameService.getPlayerHistory(currentUserId, page, limit)
  const historyListDTO = new GameHistoryListDTO(history.games, currentUserId, history.pagination)
  res.status(200).json(new SuccessResponseDTO(historyListDTO.toJSON()).toJSON())
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

    if (!isPlayerX && !isPlayerO && replay.gameInfo.gameMode !== 'local') {
      return res.status(403).json(new ErrorResponseDTO('Not authorized to view this replay', 403).toJSON())
    }
  }

  res.status(200).json(new SuccessResponseDTO(replay).toJSON())
})

const getGameStats = asyncHandler(async (req, res) => {
  const currentUserId = resolveUserId(req.user)

  if (!currentUserId) {
    return res.status(200).json(new SuccessResponseDTO(new GameStatsDTO({
      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
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

// authenticate + authorizeAdmin middleware đã guard route này; controller chỉ làm việc.
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

  if (!currentUserId) {
    return res.status(200).json(new SuccessResponseDTO([]).toJSON())
  }

  const games = await gameService.getActiveGamesForPlayer(currentUserId)
  res.status(200).json(new SuccessResponseDTO(games.map((game) => ({
    gameId: game.gameId,
    boardSize: game.boardSize,
    gameMode: game.gameMode,
    status: game.status,
    currentTurn: game.currentTurn,
    opponent: String(game.players.X.playerId) === String(currentUserId) ? game.players.O : game.players.X,
    lastMoveAt: game.lastMoveAt,
  }))).toJSON())
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
  resignGame,
  getGameReplay,
  deleteGame,
  cleanupGames,
  getGameStats,
}
