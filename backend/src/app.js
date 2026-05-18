const express = require('express')
const cors = require('cors')
const { corsOptions } = require('./config/cors')
const errorMiddleware = require('./middleware/errorMiddleware')
const authRoutes = require('./modules/auth/auth.routes')
const gameRoutes = require('./modules/game/game.routes')
const aiLogicRoutes = require('./modules/AILogic/AILogic.routes')
const gameroomRoutes = require('./modules/gameroom/gameroom.routes')
const profileRoutes = require('./modules/profile/profile.routes')
const adminRoutes = require('./modules/admin/admin.routes')
const socialRoutes = require('./modules/social/social.routes')

const app = express()

app.use(cors(corsOptions))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/ai-logic', aiLogicRoutes)
app.use('/api/gameroom', gameroomRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/social', socialRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
})

app.use(errorMiddleware)

module.exports = app
