const jwt = require('jsonwebtoken');
const { isRevoked } = require('../config/tokenStore');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  if (isRevoked(token))
    return res.status(401).json({ error: 'Token has been revoked. Please log in again.' });

  try {
    req.user  = jwt.verify(token, process.env.JWT_SECRET);
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
}

module.exports = { authenticate, requireAdmin };
