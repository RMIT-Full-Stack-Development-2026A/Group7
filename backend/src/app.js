require('dotenv').config();
const http = require('http');
const app = require('./config/express');
const connectDB = require('./config/database');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => console.log(`🚀 Backend on http://localhost:${PORT}`));
}

start().catch((err) => { console.error(err); process.exit(1); });
