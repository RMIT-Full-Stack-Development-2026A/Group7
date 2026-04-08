require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../src/config');
const User = require('../src/models/User');
const Plan = require('../src/models/Plan');
const Subscription = require('../src/models/Subscription');

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB for seeding');

  await User.deleteMany({});
  await Plan.deleteMany({});
  await Subscription.deleteMany({});

  const saltRounds = config.bcryptSaltRounds || 10;

  const adminPass = await bcrypt.hash('AdminPass123!', saltRounds);
  const admin = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: adminPass,
    country: 'VN',
    role: 'admin',
    isActive: true
  });

  const monthlyPlan = await Plan.create({
    name: 'Monthly Premium',
    priceUSD: 10,
    durationDays: 30,
    features: ['replay', 'chat', 'online-arena']
  });

  const playerAPass = await bcrypt.hash('PlayerAPass1!', saltRounds);
  const playerA = await User.create({
    username: 'playerA',
    email: 'playerA@example.com',
    passwordHash: playerAPass,
    country: 'VN',
    role: 'player',
    premiumStatus: true,
    subscriptionEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    isActive: true
  });

  await Subscription.create({
    userId: playerA._id,
    planId: monthlyPlan._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    status: 'Active',
    idempotencyKey: 'seed-playerA-1'
  });

  const playerBPass = await bcrypt.hash('PlayerBPass1!', saltRounds);
  const playerB = await User.create({
    username: 'playerB',
    email: 'playerB@example.com',
    passwordHash: playerBPass,
    country: 'VN',
    role: 'player',
    premiumStatus: false,
    isActive: true
  });

  console.log('Seed complete:');
  console.log('Admin: admin@example.com / AdminPass123!');
  console.log('Player A: playerA@example.com / PlayerAPass1!');
  console.log('Player B: playerB@example.com / PlayerBPass1!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error', err);
  process.exit(1);
});
