require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./profile-management/database/dbConnect');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB().catch(console.error);

// Routes
const startingPageRoutes = require('./starting-page/routes');
const profileManagementRoutes = require('./profile-management/routes');

app.use('/api/starting-page', startingPageRoutes);
app.use('/api/profile', profileManagementRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const { getDB } = require('./profile-management/database/dbConnect');
    const db = await getDB();
    await db.admin().ping();
    res.json({ status: 'OK', message: 'Database is connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;