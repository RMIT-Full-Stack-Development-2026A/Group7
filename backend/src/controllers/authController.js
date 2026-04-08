const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { username, email, password, country } = req.body;
    const result = await authService.register({ username, email, password, country });
    res.status(201).json({ ok: true, user: result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await authService.login({ usernameOrEmail, password });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(401).json({ ok: false, error: err.message });
  }
}

module.exports = { register, login };
