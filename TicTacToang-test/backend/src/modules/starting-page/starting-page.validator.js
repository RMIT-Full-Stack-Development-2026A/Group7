const createValidationError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureObject = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Request payload must be an object.');
  }

  return payload;
};

const validateCreateMatchDto = (payload = {}) => {
  const dto = ensureObject(payload);

  if (!dto.mode && !dto.gameMode) {
    throw createValidationError('mode or gameMode is required to create a match.');
  }

  if (dto.mode !== undefined && typeof dto.mode !== 'string') {
    throw createValidationError('mode must be a string.');
  }

  if (dto.gameMode !== undefined && typeof dto.gameMode !== 'string') {
    throw createValidationError('gameMode must be a string.');
  }

  if (dto.opponentType !== undefined && typeof dto.opponentType !== 'string') {
    throw createValidationError('opponentType must be a string.');
  }

  if (dto.visibility !== undefined && typeof dto.visibility !== 'string') {
    throw createValidationError('visibility must be a string.');
  }

  if (dto.userId !== undefined && typeof dto.userId !== 'string') {
    throw createValidationError('userId must be a string.');
  }

  return dto;
};

module.exports = {
  createValidationError,
  validateCreateMatchDto,
};
