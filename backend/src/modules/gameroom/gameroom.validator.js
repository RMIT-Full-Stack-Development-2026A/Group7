const { ErrorResponse } = require('../../shared/errors/AppErrors')

const validMarkers = [
  'X',
  'O',
  'Circle',
  'Star',
  'Triangle',
  'Heart',
  'X-O',
  'Circle-Star',
  'Square-Triangle',
  'Moon-Sun',
  'Heart-Spade',
  'Diamond-Club',
  'X-O-Triangle',
  'Circle-Star-Square',
  'Moon-Sun-Cloud',
  'Heart-Spade-Diamond',
  'Club-Diamond-Star',
  'Triangle-Square-Circle',
]

const validBoardStyles = ['Classic', 'Modern', 'Minimal']
const validBoardSizes = ['10x10', '15x15']
const validRoomSizes = [2, 3]
const validDifficulties = ['Easy', 'Medium', 'Hard']
const validRoomStatuses = ['pending', 'ready', 'started', 'completed']

const validateRoomSize = (size) => validRoomSizes.includes(size)

// Per-player chess-clock max bank, in seconds. Accept the legacy 60s lower
// bound so historical rooms still validate, but the create-room UI enforces
// the new 240s (4 min) / 720s (12 min) range.
const validateTimeToThink = (time) =>
  typeof time === 'number' && time >= 60 && time <= 720

const validateRoomName = (name) =>
  typeof name === 'string' && name.trim().length > 0 && name.length <= 50

const validateAIDifficulty = (difficulty) => validDifficulties.includes(difficulty)

const validateRoomStatus = (status) => validRoomStatuses.includes(status)

const assertCreateGameroomRequest = (body = {}) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink } = body

  if (!roomName || !validateRoomName(roomName)) {
    throw new ErrorResponse('Invalid room name', 400)
  }

  if (!size || !validateRoomSize(size)) {
    throw new ErrorResponse('Invalid room size. Must be 2 or 3', 400)
  }

  if (timeToThink && !validateTimeToThink(timeToThink)) {
    throw new ErrorResponse('Invalid timeToThink. Must be between 60 and 720 seconds (4-12 minute chess clock).', 400)
  }

  if (boardStyle && !validBoardStyles.includes(boardStyle)) {
    throw new ErrorResponse('Invalid board style', 400)
  }

  if (boardSize && !validBoardSizes.includes(boardSize)) {
    throw new ErrorResponse('Invalid board size', 400)
  }

  if (marker && !validMarkers.includes(marker)) {
    throw new ErrorResponse('Invalid marker', 400)
  }
}

const assertUpdateGameroomSettingsRequest = (body = {}) => {
  const { gameSettings } = body

  if (!gameSettings || typeof gameSettings !== 'object') {
    throw new ErrorResponse('Invalid gameSettings object', 400)
  }

  if (gameSettings.timeToThink && !validateTimeToThink(gameSettings.timeToThink)) {
    throw new ErrorResponse('Invalid timeToThink', 400)
  }
}

const buildValidator = (validatorFn) => (req, _res, next) => {
  try {
    validatorFn(req.body)
    next()
  } catch (error) {
    next(error)
  }
}

const validateCreateGameroomRequest = buildValidator(assertCreateGameroomRequest)
const validateUpdateGameroomSettingsRequest = buildValidator(assertUpdateGameroomSettingsRequest)

module.exports = {
  validateRoomSize,
  validateTimeToThink,
  validateRoomName,
  validateAIDifficulty,
  validateRoomStatus,
  validateCreateGameroomRequest,
  validateUpdateGameroomSettingsRequest,
}
