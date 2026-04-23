require('dotenv/config')
const http = require('node:http')
const app = require('./src/app')
const connectDB = require('./src/config/db')
const { seedAuthUsers } = require('./seed/seed')
const { ensureProfileSeedData } = require('./src/modules/profile/profile.model')
const { ensureStartingPageSeedData } = require('./src/modules/starting-page/starting-page.model')
const { initGameroomSocketServer } = require('./src/socket/gameroom.socket')

const PORT = process.env.PORT || 4000
const server = http.createServer(app)

initGameroomSocketServer(server)

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process using http://localhost:${PORT} and restart the backend.`)
    return
  }

  console.error('Server startup error:', error)
})

connectDB().then(async () => {
  await seedAuthUsers()

  await Promise.all([
    ensureProfileSeedData(),
    ensureStartingPageSeedData(),
  ]).catch((error) => {
    console.error('Seed initialization error:', error.message)
  })

  server.listen(PORT, () => {
    console.log(`Server:  http://localhost:${PORT}`)
    console.log(`Health:  http://localhost:${PORT}/api/health`)
    console.log(`Game api: http://localhost:${PORT}/api/games`)
    console.log(`Game history api: http://localhost:${PORT}/api/games/user/history`)
    console.log(`Game stats api: http://localhost:${PORT}/api/games/user/stats`)
    console.log(`Gameroom api: http://localhost:${PORT}/api/gameroom`)
    console.log(`User api: http://localhost:${PORT}/api/users`)
    console.log(`Profile api: http://localhost:${PORT}/api/profile`)
    console.log(`Starting page api: http://localhost:${PORT}/api/starting-page`)
  })
})
