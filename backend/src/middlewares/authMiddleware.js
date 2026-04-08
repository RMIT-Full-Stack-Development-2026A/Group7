const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ ok: false, error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ ok: false, error: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRole };
