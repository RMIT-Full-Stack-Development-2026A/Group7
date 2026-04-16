import { ErrorResponse } from '../../shared/errors/AppErrors.js'

const validMarkers = [
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
  'X-O-Triangle-Square',
  'Circle-Star-Square-Triangle',
  'Moon-Sun-Cloud-Lightning',
  'Heart-Spade-Diamond-Club',
  'Star-Circle-Heart-Diamond',
  'Triangle-Square-Club-Spade',
]

const validBoardStyles = ['Classic', 'Modern', 'Minimal']
const validBoardSizes = ['10x10', '15x15']
const validRoomSizes = [2, 3, 4]
const validDifficulties = ['Easy', 'Medium', 'Hard']
const validRoomStatuses = ['pending', 'ready', 'started', 'completed']

export const validateRoomSize = (size) => validRoomSizes.includes(size)

export const validateTimeToThink = (time) =>
  typeof time === 'number' && time >= 60 && time <= 120

export const validateRoomName = (name) =>
  typeof name === 'string' && name.trim().length > 0 && name.length <= 50

export const validateAIDifficulty = (difficulty) => validDifficulties.includes(difficulty)

export const validateRoomStatus = (status) => validRoomStatuses.includes(status)

const assertCreateGameroomRequest = (body = {}) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink } = body

  if (!roomName || !validateRoomName(roomName)) {
    throw new ErrorResponse('Invalid room name', 400)
  }

  if (!size || !validateRoomSize(size)) {
    throw new ErrorResponse('Invalid room size. Must be 2, 3, or 4', 400)
  }

  if (timeToThink && !validateTimeToThink(timeToThink)) {
    throw new ErrorResponse('Invalid timeToThink. Must be between 60 and 120 seconds', 400)
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

export const validateCreateGameroomRequest = buildValidator(assertCreateGameroomRequest)
export const validateUpdateGameroomSettingsRequest = buildValidator(assertUpdateGameroomSettingsRequest)
