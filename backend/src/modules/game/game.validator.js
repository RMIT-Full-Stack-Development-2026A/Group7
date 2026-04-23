const { ErrorResponse } = require('../../shared/errors/AppErrors')

const validGameModes = ['singleplayer', 'multiplayer', 'local']
const validBoardSizes = [10, 15]
const validOpponentTypes = ['ai', 'human']
const validAIDifficulties = ['easy', 'medium', 'hard']
const validGameStatuses = ['waiting', 'active', 'completed', 'abandoned']
const validWinReasons = ['five_in_row', 'timeout', 'resignation', 'draw_agreement', null]
const validPlayerSymbols = ['X', 'O']

const validateBoardSize = (size) => validBoardSizes.includes(size)
const validateGameMode = (mode) => validGameModes.includes(mode)
const validateOpponentType = (type) => validOpponentTypes.includes(type)
const validateAIDifficulty = (difficulty) => validAIDifficulties.includes(difficulty)
const validateTimeControl = (time) => typeof time === 'number' && time >= 30 && time <= 300
const validateMoveCoordinates = (row, col, boardSize) => (
  typeof row === 'number'
  && typeof col === 'number'
  && row >= 0
  && row < boardSize
  && col >= 0
  && col < boardSize
)
const validatePlayerSymbol = (symbol) => validPlayerSymbols.includes(symbol)
const validateGameStatus = (status) => validGameStatuses.includes(status)

const assertCreateGameRequest = (body = {}) => {
  const { gameMode, boardSize, timeControl, opponentType, aiDifficulty } = body

  if (!gameMode) throw new ErrorResponse('Game mode is required', 400)
  if (!validateGameMode(gameMode)) {
    throw new ErrorResponse(`Invalid game mode. Must be one of: ${validGameModes.join(', ')}`, 400)
  }

  if (!boardSize) throw new ErrorResponse('Board size is required', 400)
  if (!validateBoardSize(boardSize)) {
    throw new ErrorResponse(`Invalid board size. Must be one of: ${validBoardSizes.join(', ')}`, 400)
  }

  if (timeControl !== undefined && !validateTimeControl(timeControl)) {
    throw new ErrorResponse('Invalid timeControl. Must be between 30 and 300 seconds', 400)
  }

  if (!opponentType) throw new ErrorResponse('Opponent type is required', 400)
  if (!validateOpponentType(opponentType)) {
    throw new ErrorResponse(`Invalid opponent type. Must be one of: ${validOpponentTypes.join(', ')}`, 400)
  }

  if (opponentType === 'ai') {
    if (!aiDifficulty) throw new ErrorResponse('AI difficulty is required when opponent is AI', 400)
    if (!validateAIDifficulty(aiDifficulty)) {
      throw new ErrorResponse(`Invalid AI difficulty. Must be one of: ${validAIDifficulties.join(', ')}`, 400)
    }
  }
}

const assertMakeMoveRequest = (body = {}, boardSize = 15) => {
  const { row, col, timeTaken } = body

  if (row === undefined || row === null) throw new ErrorResponse('Row coordinate is required', 400)
  if (typeof row !== 'number') throw new ErrorResponse('Row must be a number', 400)

  if (col === undefined || col === null) throw new ErrorResponse('Column coordinate is required', 400)
  if (typeof col !== 'number') throw new ErrorResponse('Column must be a number', 400)

  if (!validateMoveCoordinates(row, col, boardSize)) {
    throw new ErrorResponse(`Invalid move coordinates. Must be between 0 and ${boardSize - 1}`, 400)
  }

  if (timeTaken !== undefined && (typeof timeTaken !== 'number' || timeTaken < 0 || timeTaken > 300)) {
    throw new ErrorResponse('Invalid timeTaken. Must be between 0 and 300 seconds', 400)
  }
}

const assertJoinGameRequest = (params = {}) => {
  const { gameId } = params
  if (!gameId) throw new ErrorResponse('Game ID is required', 400)
  if (typeof gameId !== 'string' || gameId.length < 10) {
    throw new ErrorResponse('Invalid game ID format', 400)
  }
}

const assertResignGameRequest = (params = {}) => {
  const { gameId } = params
  if (!gameId) throw new ErrorResponse('Game ID is required', 400)
  if (typeof gameId !== 'string' || gameId.length < 10) {
    throw new ErrorResponse('Invalid game ID format', 400)
  }
}

const assertGetGameRequest = (params = {}) => {
  const { gameId } = params
  if (!gameId) throw new ErrorResponse('Game ID is required', 400)
  if (typeof gameId !== 'string' || gameId.length < 10) {
    throw new ErrorResponse('Invalid game ID format', 400)
  }
}

const assertGetGameHistoryRequest = (query = {}) => {
  const { page, limit } = query

  if (page !== undefined) {
    const pageNum = parseInt(page, 10)
    if (Number.isNaN(pageNum) || pageNum < 1) {
      throw new ErrorResponse('Invalid page number. Must be a positive integer', 400)
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10)
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ErrorResponse('Invalid limit. Must be between 1 and 100', 400)
    }
  }
}

const buildValidator = (validatorFn, paramsExtractor = null) => (req, _res, next) => {
  try {
    if (paramsExtractor) validatorFn(paramsExtractor(req))
    else validatorFn(req.body)
    next()
  } catch (error) {
    next(error)
  }
}

const validateCreateGameRequest = buildValidator(assertCreateGameRequest)
const validateMakeMoveRequest = (boardSize) => (req, _res, next) => {
  try {
    assertMakeMoveRequest(req.body, boardSize)
    next()
  } catch (error) {
    next(error)
  }
}
const validateJoinGameRequest = buildValidator(assertJoinGameRequest, (req) => req.params)
const validateResignGameRequest = buildValidator(assertResignGameRequest, (req) => req.params)
const validateGetGameRequest = buildValidator(assertGetGameRequest, (req) => req.params)
const validateGetGameHistoryRequest = buildValidator(assertGetGameHistoryRequest, (req) => req.query)

module.exports = {
  validateCreateGameRequest,
  validateMakeMoveRequest,
  validateJoinGameRequest,
  validateResignGameRequest,
  validateGetGameRequest,
  validateGetGameHistoryRequest,
  validateBoardSize,
  validateGameMode,
  validateOpponentType,
  validateAIDifficulty,
  validateTimeControl,
  validateMoveCoordinates,
  validatePlayerSymbol,
  validateGameStatus,
  assertCreateGameRequest,
  assertMakeMoveRequest,
  assertJoinGameRequest,
  assertResignGameRequest,
  assertGetGameRequest,
  assertGetGameHistoryRequest,
  validGameModes,
  validBoardSizes,
  validOpponentTypes,
  validAIDifficulties,
  validGameStatuses,
  validWinReasons,
  validPlayerSymbols,
}
