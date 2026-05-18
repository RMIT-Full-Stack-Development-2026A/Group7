// Pure helpers for game history queries: MongoDB filter normalization and the
// completed-local-game write path. No req/res, no controller dependencies.
const gameRepository = require('./game.repository')
const { generateGameId } = require('./game.move.helpers')

const VALID_MOVE_PLAYERS = new Set(['X', 'O', 'P1', 'P2', 'P3', 'P4'])

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const buildSearchClause = (search) => {
  const trimmed = String(search).trim()
  if (!trimmed) return null
  const pattern = new RegExp(escapeRegex(trimmed), 'i')
  return {
    $or: [
      { gameId: pattern },
      { 'players.X.playerName': pattern },
      { 'players.O.playerName': pattern },
      { participants: { $elemMatch: { playerName: pattern } } },
    ],
  }
}

const buildDateRange = (dateFrom, dateTo) => {
  const completedAt = {}
  const fromDate = dateFrom ? new Date(dateFrom) : null
  const toDate = dateTo ? new Date(dateTo) : null
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    fromDate.setHours(0, 0, 0, 0)
    completedAt.$gte = fromDate
  }
  if (toDate && !Number.isNaN(toDate.getTime())) {
    toDate.setHours(23, 59, 59, 999)
    completedAt.$lte = toDate
  }
  return Object.keys(completedAt).length ? completedAt : null
}

const SYNTHETIC_ID_REGEX = /^(local_player_|ai_)/
const AI_ID_REGEX = /^ai_/

const buildGameTypeClauses = (gameType, userIdString) => {
  const normalized = String(gameType).trim().toLowerCase()
  if (!['online', 'singleplayer', 'local'].includes(normalized)) return []
  const realHumanMatch = { $not: SYNTHETIC_ID_REGEX, $nin: [null, ''] }
  const realNonHostMatch = userIdString
    ? { $not: SYNTHETIC_ID_REGEX, $nin: [userIdString, null, ''] }
    : realHumanMatch
  const hasAIClause = {
    $or: [
      { 'players.X.isAI': true },
      { 'players.O.isAI': true },
      { 'players.X.playerId': AI_ID_REGEX },
      { 'players.O.playerId': AI_ID_REGEX },
      { participants: { $elemMatch: { isAI: true } } },
      { participants: { $elemMatch: { playerId: AI_ID_REGEX } } },
    ],
  }
  const hasRealOpponentClause = {
    $or: [
      { 'players.X.playerId': realNonHostMatch },
      { 'players.O.playerId': realNonHostMatch },
      { participants: { $elemMatch: { playerId: realNonHostMatch } } },
    ],
  }
  if (normalized === 'online') return [hasRealOpponentClause]
  if (normalized === 'singleplayer') return [hasAIClause, { $nor: [hasRealOpponentClause] }]
  return [{ $nor: [hasAIClause] }, { $nor: [hasRealOpponentClause] }]
}

const buildPlayerCountClause = (playerCount) => {
  const n = Number(playerCount)
  if (!Number.isInteger(n) || ![2, 3, 4].includes(n)) return null
  if (n === 2) {
    return {
      $or: [
        { participants: { $exists: false } },
        { participants: { $size: 0 } },
        { participants: { $size: 2 } },
      ],
    }
  }
  return { participants: { $size: n } }
}

const buildResultWinClause = (userId) => ({
  $or: [
    { 'players.X.playerId': userId, 'result.winner': 'X' },
    { 'players.O.playerId': userId, 'result.winner': 'O' },
    ...['P1', 'P2', 'P3', 'P4'].map((sym) => ({
      participants: { $elemMatch: { playerId: userId, playerSymbol: sym } },
      'result.winner': sym,
    })),
  ],
})

const normalizeHistoryOptions = (userId, options = {}) => {
  const { search = '', result = '', gameType = '', playerCount = '', dateFrom = '', dateTo = '', sort = 'desc' } = options
  const filter = { status: { $in: ['completed', 'abandoned'] } }
  const andFilters = []

  const searchClause = buildSearchClause(search)
  if (searchClause) andFilters.push(searchClause)

  const dateRange = buildDateRange(dateFrom, dateTo)
  if (dateRange) filter.completedAt = dateRange

  andFilters.push(...buildGameTypeClauses(gameType, userId ? String(userId) : null))

  const playerCountClause = buildPlayerCountClause(playerCount)
  if (playerCountClause) andFilters.push(playerCountClause)

  const normalizedResult = String(result).trim().toLowerCase()
  if (normalizedResult === 'aborted') {
    filter.status = 'abandoned'
  } else if (normalizedResult === 'draw') {
    filter.status = 'completed'
    filter['result.winner'] = 'draw'
  } else if (normalizedResult === 'win') {
    filter.status = 'completed'
    andFilters.push(buildResultWinClause(userId))
  } else if (normalizedResult === 'loss' || normalizedResult === 'lose') {
    filter.status = 'completed'
    filter['result.winner'] = { $nin: ['draw', null] }
    andFilters.push({ $nor: buildResultWinClause(userId).$or })
  }

  if (andFilters.length > 0) filter.$and = andFilters
  return { filter, sortDirection: sort === 'asc' ? 'asc' : 'desc' }
}

const sanitizeMoves = (rawMoves, boardSize) => {
  if (!Array.isArray(rawMoves)) return []
  return rawMoves
    .filter((move) => move
      && Number.isInteger(move.row)
      && Number.isInteger(move.col)
      && move.row >= 0 && move.row < boardSize
      && move.col >= 0 && move.col < boardSize
      && VALID_MOVE_PLAYERS.has(String(move.player)))
    .map((move, index) => ({
      moveNumber: Number.isInteger(move.moveNumber) ? move.moveNumber : index + 1,
      player: String(move.player),
      row: move.row,
      col: move.col,
      timeTaken: Number.isFinite(move.timeTaken) ? Math.max(0, Math.min(300, move.timeTaken)) : 0,
    }))
}

const normalizeParticipants = (participants) => participants.map((participant, index) => ({
  playerId: participant.playerId || participant.id || `local_player_${index + 1}`,
  playerName: participant.playerName || participant.name || `Player ${index + 1}`,
  avatar: participant.avatar || '',
  playerSymbol: participant.playerSymbol || participant.symbol || `P${index + 1}`,
  marker: participant.marker || participant.playerSymbol || participant.symbol || `P${index + 1}`,
  order: Number(participant.order) || index + 1,
  isAI: Boolean(participant.isAI),
  aiDifficulty: participant.aiDifficulty || null,
}))

const createCompletedLocalGame = async (gameData) => {
  const {
    boardSize = 10, timeControl = 60, participants = [],
    winner = 'draw', winningTiles = [], totalMoves = 0, startedAt, moves: rawMoves = [],
  } = gameData

  if (![10, 15].includes(boardSize)) throw new Error('Board size must be 10 or 15')
  if (!Array.isArray(participants) || participants.length < 2) {
    throw new Error('At least two participants are required')
  }

  const sanitizedMoves = sanitizeMoves(rawMoves, boardSize)
  const normalized = normalizeParticipants(participants)
  const [firstPlayer, secondPlayer] = normalized
  const completedAt = new Date()
  const resolvedStartedAt = startedAt ? new Date(startedAt) : completedAt

  return gameRepository.createGame({
    gameId: generateGameId(),
    boardSize,
    gameMode: 'local',
    timeControl,
    players: {
      X: { playerId: firstPlayer.playerId, playerName: firstPlayer.playerName, avatar: firstPlayer.avatar, playerRank: 1200, isAI: firstPlayer.isAI, aiDifficulty: firstPlayer.aiDifficulty, playerSymbol: 'X' },
      O: { playerId: secondPlayer.playerId, playerName: secondPlayer.playerName, avatar: secondPlayer.avatar, playerRank: 1200, isAI: secondPlayer.isAI, aiDifficulty: secondPlayer.aiDifficulty, playerSymbol: 'O' },
    },
    participants: normalized,
    currentTurn: normalized[0]?.playerSymbol || 'P1',
    status: 'completed',
    moves: sanitizedMoves,
    result: {
      winner,
      winReason: winner === 'draw' ? 'draw_agreement' : 'five_in_row',
      winningTiles,
      totalMoves: sanitizedMoves.length > 0 ? sanitizedMoves.length : totalMoves,
    },
    startedAt: Number.isNaN(resolvedStartedAt.getTime()) ? completedAt : resolvedStartedAt,
    completedAt,
  })
}

const buildReplayFromGame = (game) => {
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
    players: { X: game.players.X, O: game.players.O },
    participants: Array.isArray(game.participants) ? game.participants : [],
    result: game.result,
    moves: replayData,
    totalMoves: game.moves.length,
  }
}

module.exports = {
  normalizeHistoryOptions,
  createCompletedLocalGame,
  buildReplayFromGame,
}
