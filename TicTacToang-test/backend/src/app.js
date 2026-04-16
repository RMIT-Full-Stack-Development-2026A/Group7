import express from 'express'
import cors from 'cors'
import errorMiddleware from './middleware/errorMiddleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import gameroomRoutes from './modules/gameroom/gameroom.routes.js'

const app = express()

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use(cors({
  origin(origin, callback) {
    if (!origin || LOCAL_ORIGIN_PATTERN.test(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/users', authRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/gameroom', gameroomRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
})

app.use(errorMiddleware)

export default app
