const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('./controller/auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 5,
  message: { error: 'Too many login attempts. Please wait 60 seconds.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const registerRules = [
  body('username').trim().notEmpty().withMessage('Username is required')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username: only letters, numbers, _ and - allowed'),
  body('email').isEmail().withMessage('Invalid email format')
    .isLength({ max: 254 }).withMessage('Email too long'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character (!@#$%^&*)')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('country').trim().notEmpty().withMessage('Country is required'),
];

router.post('/register', registerRules, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
