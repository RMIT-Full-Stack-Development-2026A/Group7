const http = require('http');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config');
const roomRoutes = require('./routes/room.routes');
const errorHandler = require('./middlewares/errorHandler');
const { initSocketServer } = require('./socket');

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gameroom';

const allowedOrigins = new Set([
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server tools and local dev frontends on common ports.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'GameRoom backend is up and running' });
});

app.use('/api/room', roomRoutes);
app.use(errorHandler);

const server = http.createServer(app);
initSocketServer(server);

connectDB(mongoUri)
  .then(() => {
    server.listen(port, () => {
      console.log('run backend successfully');
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Backend failed to start:', error);
    process.exit(1);
  });
