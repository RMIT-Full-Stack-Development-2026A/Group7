const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' })
  next()
}

const authorizePlayer = (req, res, next) => {
  if (!req.user || !['player', 'admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Player access required.' })
  }
  next()
}

module.exports = {
  authorizeAdmin,
  authorizePlayer,
}
