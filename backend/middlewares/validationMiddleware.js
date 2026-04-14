const { ErrorResponse } = require('../utils/errorResponse');
const { validateRoomName, validateRoomSize, validateTimeToThink } = require('../utils/validators');

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
];

const validateCreateRoomRequest = (req, res, next) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink } = req.body;
  
  if (!roomName || !validateRoomName(roomName)) {
    return next(new ErrorResponse('Invalid room name', 400));
  }
  
  if (!size || !validateRoomSize(size)) {
    return next(new ErrorResponse('Invalid room size. Must be 2, 3, or 4', 400));
  }
  
  if (timeToThink && !validateTimeToThink(timeToThink)) {
    return next(new ErrorResponse('Invalid timeToThink. Must be between 60 and 120 seconds', 400));
  }

  const validBoardStyles = ['Classic', 'Modern', 'Minimal'];
  if (boardStyle && !validBoardStyles.includes(boardStyle)) {
    return next(new ErrorResponse('Invalid board style', 400));
  }

  const validBoardSizes = ['10x10', '15x15'];
  if (boardSize && !validBoardSizes.includes(boardSize)) {
    return next(new ErrorResponse('Invalid board size', 400));
  }

  if (marker && !validMarkers.includes(marker)) {
    return next(new ErrorResponse('Invalid marker', 400));
  }

  next();
};

const validateUpdateRoomSettingsRequest = (req, res, next) => {
  const { gameSettings } = req.body;
  
  if (!gameSettings || typeof gameSettings !== 'object') {
    return next(new ErrorResponse('Invalid gameSettings object', 400));
  }
  
  if (gameSettings.timeToThink && !validateTimeToThink(gameSettings.timeToThink)) {
    return next(new ErrorResponse('Invalid timeToThink', 400));
  }

  next();
};

module.exports = {
  validateCreateRoomRequest,
  validateUpdateRoomSettingsRequest,
};
