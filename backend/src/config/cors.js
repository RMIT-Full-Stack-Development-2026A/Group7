const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
const PRIVATE_NETWORK_ORIGIN_PATTERN = /^https?:\/\/((10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})|(172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}))(:\d+)?$/
const TEMPORARY_TUNNEL_ORIGIN_PATTERN = /^https?:\/\/([a-z0-9-]+\.)?(loca\.lt|trycloudflare\.com|ngrok-free\.app)$/
const CLOUD_PLATFORM_ORIGIN_PATTERN = /^https:\/\/[a-z0-9-]+\.(onrender\.com|vercel\.app|netlify\.app|railway\.app|fly\.dev)$/

const splitOrigins = (value = '') =>
  String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const allowedOrigins = [
  ...splitOrigins(process.env.CORS_ORIGIN),
  ...splitOrigins(process.env.CLIENT_ORIGIN),
]

const isAllowedOrigin = (origin) => {
  if (
    !origin ||
    LOCAL_ORIGIN_PATTERN.test(origin) ||
    PRIVATE_NETWORK_ORIGIN_PATTERN.test(origin) ||
    TEMPORARY_TUNNEL_ORIGIN_PATTERN.test(origin) ||
    CLOUD_PLATFORM_ORIGIN_PATTERN.test(origin)
  ) {
    return true
  }

  return allowedOrigins.includes(origin)
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}

module.exports = {
  corsOptions,
  isAllowedOrigin,
}
