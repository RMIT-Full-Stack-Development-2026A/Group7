import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' })
  }
  try {
    const token  = authHeader.split(' ')[1]
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired. Please login again.'
      : 'Invalid token.'
    return res.status(401).json({ message: msg })
  }
}