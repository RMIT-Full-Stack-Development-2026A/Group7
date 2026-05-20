const gameRepository = require('./game.repository')
const { checkWin } = require('./WinDetection')
const aiLogicService = require('../AILogic/AILogic.service')
const {
  generateGameId,
  isValidMove,
  isEmptyTile,
  getBoardStateFromMoves,
  getWinningTilesFromBoard,
} = require('./game.move.helpers')
const {
  normalizeHistoryOptions,
  createCompletedLocalGame,
  buildReplayFromGame,
} = require('./game.history.helpers')

const createNewGame = async (gameData) => {
  const { gameMode, boardSize = 15, timeControl = 60, playerX, playerO, participants = [] } = gameData

  if (!playerX || !playerO) throw new Error('Both players are required')
  if (!['singleplayer', 'multiplayer', 'local'].includes(gameMode)) {
    throw new Error('Invalid game mode')
  }
  if (![10, 15].includes(boardSize)) throw new Error('Board size must be 10 or 15')

  return gameRepository.createGame({
    gameId: generateGameId(),
    boardSize,
    gameMode,
    timeControl,
    players: {
      X: { ...playerX, playerSymbol: 'X' },
      O: { ...playerO, playerSymbol: 'O' },
    },
    participants,
    currentTurn: 'X',
    status: gameMode === 'multiplayer' ? 'waiting' : 'active',
    moves: [],
    result: { winner: null, winReason: null, winningTiles: [], totalMoves: 0 },
  })
}

const getGameById = async (gameId) => {
  const game = await gameRepository.findByGameId(gameId)
  if (!game) throw new Error('Game not found')
  return game
}

const getActiveGamesForPlayer = async (userId) =>
  gameRepository.findActiveGamesByPlayer(userId)

const getGames = async (limit = 20) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
  return gameRepository.findAllGames({}, { sort: { createdAt: -1 }, limit: safeLimit })
}

const getPlayerHistory = async (userId, page = 1, limit = 20, options = {}) => {
  const skip = (page - 1) * limit
  const historyOptions = normalizeHistoryOptions(userId, options)
  const games = await gameRepository.findHistoryByPlayer(userId, limit, skip, historyOptions)
  const total = await gameRepository.countHistoryByPlayer(userId, historyOptions.filter)

  return {
    games,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

const getWaitingGames = async (currentUserId, boardSize = null) =>
  gameRepository.findWaitingGames(currentUserId, boardSize)

const joinGame = async (gameId, playerO) => {
  const game = await getGameById(gameId)

  if (game.status !== 'waiting') throw new Error('Game is not waiting for players')
  if (game.gameMode !== 'multiplayer') throw new Error('Cannot join non-multiplayer game')
  if (game.players.O.playerId) throw new Error('Game already has an opponent')

  return gameRepository.updateGameByGameId(gameId, {
    'players.O.playerId': playerO.playerId,
    'players.O.playerName': playerO.playerName,
    'players.O.playerRank': playerO.playerRank || 1200,
    'players.O.isAI': false,
    'players.O.aiDifficulty': null,
    status: 'active',
  })
}

const completeWithWin = async (gameId, moveData, currentPlayerSymbol, testBoard, row, col) => {
  const winningTiles = getWinningTilesFromBoard(testBoard, row, col, currentPlayerSymbol)
  const gameAfterMove = await gameRepository.addMoveToGame(gameId, moveData, currentPlayerSymbol)
  if (!gameAfterMove) throw new Error('Move could not be applied because the turn changed')
  const completedGame = await gameRepository.completeGame(gameId, {
    winner: currentPlayerSymbol,
    winReason: 'five_in_row',
    winningTiles,
  })
  return { game: completedGame, move: moveData, isWin: true, isDraw: false }
}

const completeWithDraw = async (gameId, moveData, currentPlayerSymbol) => {
  const gameAfterMove = await gameRepository.addMoveToGame(gameId, moveData, currentPlayerSymbol)
  if (!gameAfterMove) throw new Error('Move could not be applied because the turn changed')
  const completedGame = await gameRepository.completeGame(gameId, {
    winner: 'draw',
    winReason: 'draw_agreement',
    winningTiles: [],
  })
  return { game: completedGame, move: moveData, isWin: false, isDraw: true }
}

const makeMove = async (gameId, playerId, row, col, timeTaken, checkWinCallback = checkWin) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') throw new Error('Game is not active')

  const currentPlayerSymbol = game.currentTurn
  const currentPlayer = game.players[currentPlayerSymbol]

  if (String(currentPlayer.playerId) !== String(playerId)) throw new Error('Not your turn')
  if (!isValidMove(row, col, game.boardSize)) throw new Error('Invalid move coordinates')

  const board = getBoardStateFromMoves(game.moves, game.boardSize)
  if (!isEmptyTile(board, row, col)) throw new Error('Tile is already occupied')

  const moveData = {
    moveNumber: game.moves.length + 1,
    player: currentPlayerSymbol,
    row,
    col,
    timeTaken: timeTaken || 0,
  }

  const testBoard = board.map((boardRow) => [...boardRow])
  testBoard[row][col] = currentPlayerSymbol

  if (checkWinCallback(testBoard, row, col, currentPlayerSymbol)) {
    return completeWithWin(gameId, moveData, currentPlayerSymbol, testBoard, row, col)
  }

  const isDraw = testBoard.every((boardRow) => boardRow.every((cell) => cell !== null))
  if (isDraw) {
    return completeWithDraw(gameId, moveData, currentPlayerSymbol)
  }

  const updatedGame = await gameRepository.addMoveToGame(gameId, moveData, currentPlayerSymbol)
  if (!updatedGame) throw new Error('Move could not be applied because the turn changed')

  const timeField = `players.${currentPlayerSymbol}.totalTimeUsed`
  await gameRepository.updateGameByGameId(gameId, {
    [timeField]: (currentPlayer.totalTimeUsed || 0) + (timeTaken || 0),
  })

  return { game: updatedGame, move: moveData, isWin: false, isDraw: false }
}

const makeAIMove = async (gameId) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') throw new Error('Game is not active')

  const aiSymbol = Object.keys(game.players).find((symbol) => game.players[symbol]?.isAI)
  if (!aiSymbol) throw new Error('This game does not have an AI player')
  if (game.currentTurn !== aiSymbol) throw new Error('It is not the AI turn')

  const aiPlayer = game.players[aiSymbol]
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X'
  const board = getBoardStateFromMoves(game.moves, game.boardSize)
  const move = aiLogicService.getAIMove(board, aiPlayer.aiDifficulty || 'medium', aiSymbol, humanSymbol)

  if (!move) throw new Error('No valid AI move available')

  return makeMove(gameId, aiPlayer.playerId, move.row, move.col, 0, checkWin)
}

const skipTurn = async (gameId, playerId, expectedTurn = null, timeTaken = 0) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') throw new Error('Game is not active')

  const currentPlayerSymbol = game.currentTurn
  if (expectedTurn && expectedTurn !== currentPlayerSymbol) {
    throw new Error('Turn already changed')
  }

  const currentPlayer = game.players[currentPlayerSymbol]
  if (playerId && String(currentPlayer.playerId) !== String(playerId) && !currentPlayer.isAI) {
    throw new Error('Not your turn')
  }

  const updatedGame = await gameRepository.skipTurn(gameId, currentPlayerSymbol, timeTaken)
  if (!updatedGame) throw new Error('Turn could not be skipped because the turn changed')

  return {
    game: updatedGame,
    skippedPlayer: currentPlayerSymbol,
    currentTurn: updatedGame.currentTurn,
    timeTaken: Math.max(0, Number(timeTaken) || 0),
  }
}

const resignGame = async (gameId, playerId) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') throw new Error('Game is not active')

  const isPlayerX = String(game.players.X.playerId) === String(playerId)
  const isPlayerO = String(game.players.O.playerId) === String(playerId)

  if (!isPlayerX && !isPlayerO) throw new Error('Player not in this game')

  return gameRepository.completeGame(gameId, {
    winner: isPlayerX ? 'O' : 'X',
    winReason: 'resignation',
    winningTiles: [],
  })
}

const getGameReplay = async (gameId) => {
  const game = await getGameById(gameId)
  if (game.status !== 'completed') throw new Error('Game is not completed yet')
  return buildReplayFromGame(game)
}

const deleteGame = async (gameId) => {
  const game = await gameRepository.deleteGameByGameId(gameId)
  if (!game) throw new Error('Game not found')
  return game
}

const abortGame = async (gameId) => {
  const game = await gameRepository.findByGameId(gameId)
  if (!game) return { gameId, deleted: false, alreadyMissing: true }
  if (game.status === 'completed') return { gameId, deleted: false, alreadyCompleted: true }
  await gameRepository.deleteGameByGameId(gameId)
  return { gameId, deleted: true }
}

const cleanupAbandonedGames = async (minutesOld = 60) => {
  const cutoffDate = new Date(Date.now() - minutesOld * 60 * 1000)
  const abandonedGames = await gameRepository.findAllGames({
    status: { $in: ['waiting', 'active'] },
    lastMoveAt: { $lt: cutoffDate },
  })

  let cleanedCount = 0
  for (const game of abandonedGames) {
    await gameRepository.updateGameByGameId(game.gameId, {
      status: 'abandoned',
      completedAt: new Date(),
      result: {
        winner: null,
        winReason: 'timeout',
        winningTiles: [],
        totalMoves: game.moves.length,
      },
    })
    cleanedCount += 1
  }

  return { cleanedCount, totalAbandoned: abandonedGames.length }
}

const getPlayerGameStats = async (userId) => gameRepository.getPlayerGameStats(userId)

module.exports = {
  createNewGame,
  createCompletedLocalGame,
  getGameById,
  getGames,
  getActiveGamesForPlayer,
  getPlayerHistory,
  getWaitingGames,
  getGameReplay,
  joinGame,
  makeMove,
  makeAIMove,
  skipTurn,
  resignGame,
  deleteGame,
  abortGame,
  cleanupAbandonedGames,
  getPlayerGameStats,
}
