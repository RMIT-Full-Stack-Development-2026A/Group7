const { validationResult } = require('express-validator');
const authService = require('../service/auth.service');

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.token, req.user);
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { register, login, logout, me };
