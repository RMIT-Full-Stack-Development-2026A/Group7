const express = require('express')
const cors = require('cors')
const errorMiddleware = require('./middleware/errorMiddleware')
const authRoutes = require('./modules/auth/auth.routes')
const gameroomRoutes = require('./modules/gameroom/gameroom.routes')
const profileRoutes = require('./modules/profile/profile.routes')
const startingPageRoutes = require('./modules/starting-page/starting-page.routes')
const adminRoutes = require('./modules/admin/admin.routes')

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
app.use('/api/profile', profileRoutes)
app.use('/api/starting-page', startingPageRoutes)
app.use('/api/startingpage', startingPageRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
})

app.use(errorMiddleware)

module.exports = app
