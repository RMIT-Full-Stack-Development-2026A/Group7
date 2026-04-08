const rateLimit = require('express-rate-limit');
const config = require('../config');

const loginLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { ok: false, error: 'Too many login attempts, try again later' }
});

module.exports = { loginLimiter };
