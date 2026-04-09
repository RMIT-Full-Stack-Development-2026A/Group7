const jwt = require('jsonwebtoken');
const config = require('../config'); // contains jwtSecret

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ ok: false, error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== 'admin') return res.status(403).json({ ok: false, error: 'Admin role required' });
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

module.exports = { requireAdmin };
