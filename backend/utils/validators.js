const validateRoomSize = (size) => {
  const validSizes = [2, 3, 4];
  return validSizes.includes(size);
};

const validateTimeToThink = (time) => {
  return typeof time === 'number' && time >= 60 && time <= 120;
};

const validateRoomName = (name) => {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 50;
};

const validateAIDifficulty = (difficulty) => {
  const validDifficulties = ['Easy', 'Medium', 'Hard'];
  return validDifficulties.includes(difficulty);
};

const validateRoomStatus = (status) => {
  const validStatuses = ['pending', 'ready', 'started', 'completed'];
  return validStatuses.includes(status);
};

module.exports = {
  validateRoomSize,
  validateTimeToThink,
  validateRoomName,
  validateAIDifficulty,
  validateRoomStatus,
};
