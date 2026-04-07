require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tictactoang')
  .then(() => app.listen(PORT, () => console.log(`Backend listening on ${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });