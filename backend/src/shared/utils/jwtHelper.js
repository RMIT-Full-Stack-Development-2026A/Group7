const jwt = require('jsonwebtoken')

const DEFAULT_DEV_JWT_SECRET = 'tictactoang-local-dev-secret'
const DEFAULT_JWT_EXPIRES_IN = '1d'

let warnedAboutJwtFallback = false

const getJwtConfig = () => {
  if (process.env.JWT_SECRET) {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const error = new Error('JWT_SECRET must be configured in production.')
    error.statusCode = 500
    throw error
  }

  if (!warnedAboutJwtFallback) {
    warnedAboutJwtFallback = true
    console.warn('JWT_SECRET is not set. Using the local development fallback secret.')
  }

  return {
    secret: DEFAULT_DEV_JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  }
}

const generateToken = (payload) => {
  const { secret, expiresIn } = getJwtConfig()
  return jwt.sign(payload, secret, { expiresIn })
}

const verifyToken = (token) => {
  const { secret } = getJwtConfig()
  return jwt.verify(token, secret)
}

module.exports = { generateToken, verifyToken }