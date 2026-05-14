const crypto = require('crypto')
const gameRepository = require('./game.repository')
const { checkWin } = require('./WinDetection')
const aiLogicService = require('../AILogic/AILogic.service')

const generateGameId = () => {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `GAME_${timestamp}_${random}`
}

const isValidMove = (row, col, boardSize) => row >= 0 && row < boardSize && col >= 0 && col < boardSize
const isEmptyTile = (board, row, col) => board[row][col] === null

const createNewGame = async (gameData) => {
  const {
    gameMode,
    boardSize = 15,
    timeControl = 60,
    playerX,
    playerO,
    participants = [],
  } = gameData

  if (!playerX || !playerO) {
    throw new Error('Both players are required')
  }

  if (!['singleplayer', 'multiplayer', 'local'].includes(gameMode)) {
    throw new Error('Invalid game mode')
  }

  if (![10, 15].includes(boardSize)) {
    throw new Error('Board size must be 10 or 15')
  }

  const gameId = generateGameId()

  return gameRepository.createGame({
    gameId,
    boardSize,
    gameMode,
    timeControl,
    players: {
      X: {
        ...playerX,
        playerSymbol: 'X',
      },
      O: {
        ...playerO,
        playerSymbol: 'O',
      },
    },
    participants,
    currentTurn: 'X',
    status: gameMode === 'multiplayer' ? 'waiting' : 'active',
    moves: [],
    result: {
      winner: null,
      winReason: null,
      winningTiles: [],
      totalMoves: 0,
    },
  })
}

const getGameById = async (gameId) => {
  const game = await gameRepository.findByGameId(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  return game
}

const getGameByMongoId = async (id) => {
  const game = await gameRepository.findByMongoId(id)
  if (!game) {
    throw new Error('Game not found')
  }
  return game
}

const getActiveGamesForPlayer = async (userId) => gameRepository.findActiveGamesByPlayer(userId)

const getGames = async (limit = 20) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
  return gameRepository.findAllGames(
    {},
    {
      sort: { createdAt: -1 },
      limit: safeLimit,
    }
  )
}

const getPlayerHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit
  const games = await gameRepository.findHistoryByPlayer(userId, limit, skip)
  const total = await gameRepository.countGamesByPlayer(userId, 'completed')

  return {
    games,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const createCompletedLocalGame = async (gameData) => {
  const {
    boardSize = 10,
    timeControl = 60,
    participants = [],
    winner = 'draw',
    winningTiles = [],
    totalMoves = 0,
    startedAt,
  } = gameData

  if (![10, 15].includes(boardSize)) {
    throw new Error('Board size must be 10 or 15')
  }

  if (!Array.isArray(participants) || participants.length < 2) {
    throw new Error('At least two participants are required')
  }

  const normalizedParticipants = participants.map((participant, index) => ({
    playerId: participant.playerId || participant.id || `local_player_${index + 1}`,
    playerName: participant.playerName || participant.name || `Player ${index + 1}`,
    avatar: participant.avatar || '',
    playerSymbol: participant.playerSymbol || participant.symbol || `P${index + 1}`,
    marker: participant.marker || participant.playerSymbol || participant.symbol || `P${index + 1}`,
    order: Number(participant.order) || index + 1,
    isAI: Boolean(participant.isAI),
    aiDifficulty: participant.aiDifficulty || null,
  }))
  const firstPlayer = normalizedParticipants[0]
  const secondPlayer = normalizedParticipants[1]
  const completedAt = new Date()
  const resolvedStartedAt = startedAt ? new Date(startedAt) : completedAt

  return gameRepository.createGame({
    gameId: generateGameId(),
    boardSize,
    gameMode: 'local',
    timeControl,
    players: {
      X: {
        playerId: firstPlayer.playerId,
        playerName: firstPlayer.playerName,
        avatar: firstPlayer.avatar,
        playerRank: 1200,
        isAI: firstPlayer.isAI,
        aiDifficulty: firstPlayer.aiDifficulty,
        playerSymbol: 'X',
      },
      O: {
        playerId: secondPlayer.playerId,
        playerName: secondPlayer.playerName,
        avatar: secondPlayer.avatar,
        playerRank: 1200,
        isAI: secondPlayer.isAI,
        aiDifficulty: secondPlayer.aiDifficulty,
        playerSymbol: 'O',
      },
    },
    participants: normalizedParticipants,
    currentTurn: normalizedParticipants[0]?.playerSymbol || 'P1',
    status: 'completed',
    moves: [],
    result: {
      winner,
      winReason: winner === 'draw' ? 'draw_agreement' : 'five_in_row',
      winningTiles,
      totalMoves,
    },
    startedAt: Number.isNaN(resolvedStartedAt.getTime()) ? completedAt : resolvedStartedAt,
    completedAt,
  })
}

const getWaitingGames = async (currentUserId, boardSize = null) => (
  gameRepository.findWaitingGames(currentUserId, boardSize)
)

const joinGame = async (gameId, playerO) => {
  const game = await getGameById(gameId)

  if (game.status !== 'waiting') {
    throw new Error('Game is not waiting for players')
  }

  if (game.gameMode !== 'multiplayer') {
    throw new Error('Cannot join non-multiplayer game')
  }

  if (game.players.O.playerId) {
    throw new Error('Game already has an opponent')
  }

  return gameRepository.updateGameByGameId(gameId, {
    'players.O.playerId': playerO.playerId,
    'players.O.playerName': playerO.playerName,
    'players.O.playerRank': playerO.playerRank || 1200,
    'players.O.isAI': false,
    'players.O.aiDifficulty': null,
    status: 'active',
  })
}

const getBoardStateFromMoves = (moves, boardSize) => {
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))

  for (const move of moves) {
    board[move.row][move.col] = move.player
  }

  return board
}

const getWinningTilesFromBoard = (board, row, col, player) => {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ]

  const size = board.length

  for (const { dr, dc } of directions) {
    const tiles = [{ row, col }]
    let count = 1

    for (let step = 1; step <= 4; step += 1) {
      const newRow = row + dr * step
      const newCol = col + dc * step
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break
      if (board[newRow][newCol] !== player) break
      tiles.push({ row: newRow, col: newCol })
      count += 1
    }

    for (let step = 1; step <= 4; step += 1) {
      const newRow = row - dr * step
      const newCol = col - dc * step
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break
      if (board[newRow][newCol] !== player) break
      tiles.push({ row: newRow, col: newCol })
      count += 1
    }

    if (count >= 5) {
      return tiles
    }
  }

  return []
}

const makeMove = async (gameId, playerId, row, col, timeTaken, checkWinCallback = checkWin) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') {
    throw new Error('Game is not active')
  }

  const currentPlayerSymbol = game.currentTurn
  const currentPlayer = game.players[currentPlayerSymbol]

  if (String(currentPlayer.playerId) !== String(playerId)) {
    throw new Error('Not your turn')
  }

  if (!isValidMove(row, col, game.boardSize)) {
    throw new Error('Invalid move coordinates')
  }

  const board = getBoardStateFromMoves(game.moves, game.boardSize)

  if (!isEmptyTile(board, row, col)) {
    throw new Error('Tile is already occupied')
  }

  const moveNumber = game.moves.length + 1
  const moveData = {
    moveNumber,
    player: currentPlayerSymbol,
    row,
    col,
    timeTaken: timeTaken || 0,
  }

  const testBoard = board.map((boardRow) => [...boardRow])
  testBoard[row][col] = currentPlayerSymbol

  const isWin = checkWinCallback(testBoard, row, col, currentPlayerSymbol)

  if (isWin) {
    const winningTiles = getWinningTilesFromBoard(testBoard, row, col, currentPlayerSymbol)
    await gameRepository.addMoveToGame(gameId, moveData)
    const completedGame = await gameRepository.completeGame(gameId, {
      winner: currentPlayerSymbol,
      winReason: 'five_in_row',
      winningTiles,
    })

    return {
      game: completedGame,
      move: moveData,
      isWin: true,
      isDraw: false,
    }
  }

  const isDraw = testBoard.every((boardRow) => boardRow.every((cell) => cell !== null))

  if (isDraw) {
    await gameRepository.addMoveToGame(gameId, moveData)
    const completedGame = await gameRepository.completeGame(gameId, {
      winner: 'draw',
      winReason: 'draw_agreement',
      winningTiles: [],
    })

    return {
      game: completedGame,
      move: moveData,
      isWin: false,
      isDraw: true,
    }
  }

  const updatedGame = await gameRepository.addMoveToGame(gameId, moveData)
  const timeField = `players.${currentPlayerSymbol}.totalTimeUsed`

  await gameRepository.updateGameByGameId(gameId, {
    [timeField]: (currentPlayer.totalTimeUsed || 0) + (timeTaken || 0),
  })

  return {
    game: updatedGame,
    move: moveData,
    isWin: false,
    isDraw: false,
  }
}

const makeAIMove = async (gameId) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') {
    throw new Error('Game is not active')
  }

  const aiSymbol = Object.keys(game.players).find((symbol) => game.players[symbol]?.isAI)
  if (!aiSymbol) {
    throw new Error('This game does not have an AI player')
  }

  if (game.currentTurn !== aiSymbol) {
    throw new Error('It is not the AI turn')
  }

  const aiPlayer = game.players[aiSymbol]
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X'
  const board = getBoardStateFromMoves(game.moves, game.boardSize)
  const move = aiLogicService.getAIMove(
    board,
    aiPlayer.aiDifficulty || 'medium',
    aiSymbol,
    humanSymbol
  )

  if (!move) {
    throw new Error('No valid AI move available')
  }

  return makeMove(gameId, aiPlayer.playerId, move.row, move.col, 0, checkWin)
}

const resignGame = async (gameId, playerId) => {
  const game = await getGameById(gameId)

  if (game.status !== 'active') {
    throw new Error('Game is not active')
  }

  const isPlayerX = String(game.players.X.playerId) === String(playerId)
  const isPlayerO = String(game.players.O.playerId) === String(playerId)

  if (!isPlayerX && !isPlayerO) {
    throw new Error('Player not in this game')
  }

  const winner = isPlayerX ? 'O' : 'X'

  return gameRepository.completeGame(gameId, {
    winner,
    winReason: 'resignation',
    winningTiles: [],
  })
}

const getGameReplay = async (gameId) => {
  const game = await getGameById(gameId)

  if (game.status !== 'completed') {
    throw new Error('Game is not completed yet')
  }

  const replayData = []
  const board = Array(game.boardSize).fill(null).map(() => Array(game.boardSize).fill(null))

  for (let i = 0; i < game.moves.length; i += 1) {
    const move = game.moves[i]
    board[move.row][move.col] = move.player

    replayData.push({
      moveNumber: move.moveNumber,
      player: move.player,
      row: move.row,
      col: move.col,
      timeTaken: move.timeTaken,
      boardState: JSON.parse(JSON.stringify(board)),
    })
  }

  return {
    gameInfo: {
      gameId: game.gameId,
      boardSize: game.boardSize,
      gameMode: game.gameMode,
      startedAt: game.startedAt,
      completedAt: game.completedAt,
      duration: game.duration,
      result: game.result,
    },
    players: {
      X: game.players.X,
      O: game.players.O,
    },
    moves: replayData,
    totalMoves: game.moves.length,
  }
}

const deleteGame = async (gameId) => {
  const game = await gameRepository.deleteGameByGameId(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  return game
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

const createGameSession = async (roomId, playerIds = []) => {
  const hostId = playerIds[0] || `room_${roomId}_host`
  const guestId = playerIds[1] || `room_${roomId}_guest`

  return createNewGame({
    gameMode: 'multiplayer',
    boardSize: 15,
    timeControl: 60,
    playerX: {
      playerId: hostId,
      playerName: `Player ${String(hostId).slice(-4)}`,
      playerRank: 1200,
      isAI: false,
      aiDifficulty: null,
    },
    playerO: {
      playerId: guestId,
      playerName: `Player ${String(guestId).slice(-4)}`,
      playerRank: 1200,
      isAI: false,
      aiDifficulty: null,
    },
  })
}

module.exports = {
  createNewGame,
  createCompletedLocalGame,
  getGameById,
  getGameByMongoId,
  getGames,
  getActiveGamesForPlayer,
  getPlayerHistory,
  getWaitingGames,
  getGameReplay,
  joinGame,
  makeMove,
  makeAIMove,
  resignGame,
  generateGameId,
  isValidMove,
  isEmptyTile,
  getBoardStateFromMoves,
  deleteGame,
  cleanupAbandonedGames,
  getPlayerGameStats,
  createGameSession,
}
