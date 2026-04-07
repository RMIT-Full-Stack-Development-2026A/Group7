require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tictactoang');
  // Implement models and create Admin, Player A, Player B, and a sample plan
  console.log('Seed placeholder - implement model creation');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
