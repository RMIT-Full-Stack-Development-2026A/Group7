const jwt = require('jsonwebtoken')
const tokenBlacklist = require('../modules/auth/auth.tokenBlacklist')

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  if (tokenBlacklist.isRevoked(token)) {
    return res.status(401).json({ message: 'Session has ended. Please log in again.' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    req.token = token
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

// Soft auth: populates req.user when a valid JWT is present, but never blocks
// the request. Useful for endpoints that support both authenticated users and
// guests (e.g. local play / lobby browsing).
const optionalAuthenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token && !tokenBlacklist.isRevoked(token)) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
      req.token = token
    } catch {
      req.user = null
    }
  }

  next()
}

module.exports = {
  authenticate,
  optionalAuthenticate,
}
