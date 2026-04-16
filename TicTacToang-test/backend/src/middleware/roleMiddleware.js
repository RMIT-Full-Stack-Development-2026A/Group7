export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access only.' })
  next()
}

export const authorizePlayer = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'Login required.' })
  next()
}