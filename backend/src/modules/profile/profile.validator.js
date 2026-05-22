const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
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

  if (dto.username !== undefined) {
    if (typeof dto.username !== 'string') {
      throw createValidationError('username must be a string.');
    }

    const trimmedUsername = dto.username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      throw createValidationError('Username must be 3-30 characters.');
    }
    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      throw createValidationError('Username may only contain letters, numbers, _ and -.');
    }
    dto.username = trimmedUsername;
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

  if (dto.amount !== undefined && Number.isNaN(Number(dto.amount))) {
    throw createValidationError('amount must be a number.');
  }

  if (dto.currency !== undefined && typeof dto.currency !== 'string') {
    throw createValidationError('currency must be a string.');
  }

  if (dto.provider !== undefined && typeof dto.provider !== 'string') {
    throw createValidationError('provider must be a string.');
  }

  if (dto.paypalEmail !== undefined && (typeof dto.paypalEmail !== 'string' || !EMAIL_PATTERN.test(dto.paypalEmail))) {
    throw createValidationError('paypalEmail must be a valid email address.');
  }

  if (dto.billingCycle !== undefined && typeof dto.billingCycle !== 'string') {
    throw createValidationError('billingCycle must be a string.');
  }

  if (dto.receiptEmail !== undefined && (typeof dto.receiptEmail !== 'string' || !EMAIL_PATTERN.test(dto.receiptEmail))) {
    throw createValidationError('receiptEmail must be a valid email address.');
  }

  if (dto.paypalOrderId !== undefined && typeof dto.paypalOrderId !== 'string') {
    throw createValidationError('paypalOrderId must be a string.');
  }

  if (dto.paypalCaptureId !== undefined && typeof dto.paypalCaptureId !== 'string') {
    throw createValidationError('paypalCaptureId must be a string.');
  }

  if (dto.paymentStatus !== undefined && typeof dto.paymentStatus !== 'string') {
    throw createValidationError('paymentStatus must be a string.');
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
