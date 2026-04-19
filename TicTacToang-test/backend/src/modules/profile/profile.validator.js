const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(['player', 'admin', 'moderator']);

const createValidationError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureObject = (payload, fallback = {}) => {
  if (payload === undefined || payload === null) {
    return fallback;
  }

  if (typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Request payload must be an object.');
  }

  return payload;
};

const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    throw createValidationError('A valid userId is required.');
  }

  return userId.trim();
};

const validateProfileUpdateDto = (payload = {}) => {
  const dto = ensureObject(payload);

  if (dto.name !== undefined) {
    if (typeof dto.name !== 'string') {
      throw createValidationError('name must be a string.');
    }

    const trimmedName = dto.name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      throw createValidationError('name must be 3-50 characters.');
    }
  }

  if (dto.email !== undefined && (typeof dto.email !== 'string' || !EMAIL_PATTERN.test(dto.email))) {
    throw createValidationError('email must be a valid email address.');
  }

  if (dto.passwordHash !== undefined && typeof dto.passwordHash !== 'string') {
    throw createValidationError('passwordHash must be a string.');
  }

  if (dto.country !== undefined && typeof dto.country !== 'string') {
    throw createValidationError('country must be a string.');
  }

  if (dto.role !== undefined && !VALID_ROLES.has(dto.role)) {
    throw createValidationError('role must be one of: player, admin, moderator.');
  }

  if (dto.premiumStatus !== undefined && typeof dto.premiumStatus !== 'boolean') {
    throw createValidationError('premiumStatus must be a boolean.');
  }

  if (dto.subscriptionEndDate !== undefined && dto.subscriptionEndDate !== null && Number.isNaN(Date.parse(dto.subscriptionEndDate))) {
    throw createValidationError('subscriptionEndDate must be a valid datetime or null.');
  }

  if (dto.isActive !== undefined && typeof dto.isActive !== 'boolean') {
    throw createValidationError('isActive must be a boolean.');
  }

  if (dto.avatarUrl !== undefined && typeof dto.avatarUrl !== 'string') {
    throw createValidationError('avatarUrl must be a string.');
  }

  return dto;
};

const validateSettingsUpdateDto = (payload = {}) => {
  const dto = ensureObject(payload);

  if (dto.theme !== undefined && typeof dto.theme !== 'string') {
    throw createValidationError('theme must be a string.');
  }

  if (dto.notifications !== undefined && typeof dto.notifications !== 'boolean') {
    throw createValidationError('notifications must be a boolean.');
  }

  if (dto.soundEnabled !== undefined && typeof dto.soundEnabled !== 'boolean') {
    throw createValidationError('soundEnabled must be a boolean.');
  }

  if (dto.language !== undefined && typeof dto.language !== 'string') {
    throw createValidationError('language must be a string.');
  }

  if (dto.twoFactorEnabled !== undefined && typeof dto.twoFactorEnabled !== 'boolean') {
    throw createValidationError('twoFactorEnabled must be a boolean.');
  }

  return dto;
};

const validateSubscriptionDto = (payload = {}) => {
  const dto = ensureObject(payload);

  if (typeof dto.premiumStatus !== 'boolean') {
    throw createValidationError('premiumStatus must be provided as a boolean.');
  }

  if (dto.subscriptionEndDate !== undefined && dto.subscriptionEndDate !== null && Number.isNaN(Date.parse(dto.subscriptionEndDate))) {
    throw createValidationError('subscriptionEndDate must be a valid datetime or null.');
  }

  return dto;
};

module.exports = {
  createValidationError,
  validateUserId,
  validateProfileUpdateDto,
  validateSettingsUpdateDto,
  validateSubscriptionDto,
};
