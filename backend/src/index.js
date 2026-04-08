require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config'); // create if not present
const authRoutes = require('./routes/auth.routes'); 

const app = express();

// Basic security and parsing
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // protect against huge payloads
app.use(express.urlencoded({ extended: true }));

// Logging (skip in test env)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount routes (example)
app.use('/api/auth', authRoutes);

// Health and readiness endpoints
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ready });
});

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ ok: false, error: err.message || 'Internal Server Error' });
});

// Export app for tests and for programmatic control
module.exports = app;

// Start server only when run directly
if (require.main === module) {
  mongoose.set('strictQuery', false);
    mongoose.connect(config.mongoUri)
    .then(() => {
        const server = app.listen(config.port, () => {
        console.log(`Backend listening on ${config.port}`);
        });

        // graceful shutdown
        const shutdown = async () => {
        console.log('Shutting down server...');
        server.close(() => console.log('HTTP server closed'));
        try {
            await mongoose.disconnect();
            console.log('Mongo disconnected');
        } catch (e) {
            console.error('Error during Mongo disconnect', e);
        }
        process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    })
    .catch(err => {
        console.error('Mongo connection error', err);
        process.exit(1);
    });
}
