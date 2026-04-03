const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const gameRoutes = require('../modules/game/game.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const planRoutes = require('../modules/plans/plans.routes');
const subscriptionRoutes = require('../modules/subscription/subscription.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/games', gameRoutes);
app.use('/admin', adminRoutes);
app.use('/plans', planRoutes);
app.use('/subscriptions', subscriptionRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
