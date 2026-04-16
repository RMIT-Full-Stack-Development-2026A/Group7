import 'dotenv/config'
import http      from 'node:http'
import app       from './src/app.js'
import connectDB from './src/config/db.js'

const PORT   = process.env.PORT || 4000
const server = http.createServer(app)

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server:  http://localhost:${PORT}`)
    console.log(`Health:  http://localhost:${PORT}/api/health`)
  })
})