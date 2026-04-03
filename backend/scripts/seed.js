/**
 * Gold Data Set seed.
 * Run: npm run seed  (from /backend)
 *
 * Creates:
 *   - 1 Admin account
 *   - Player A  (premium active)
 *   - Player B  (standard)
 *   - 2 Plans   (monthly-gold, monthly-standard)
 *   - 1 sample completed game session
 *   - 1 active subscription for Player A
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User         = require('../src/models/User');
const Plan         = require('../src/models/Plan');
const Subscription = require('../src/models/Subscription');
const Payment      = require('../src/models/Payment');
const GameSession  = require('../src/models/GameSession');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tictactoang';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing seed data
  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@tictactoang.com', 'playera@tictactoang.com', 'playerb@tictactoang.com'] } }),
    Plan.deleteMany({}),
    Subscription.deleteMany({}),
    Payment.deleteMany({}),
    GameSession.deleteMany({ gameType: 'local' }),
  ]);

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hash(p, 12);

  const admin = await User.create({
    username: 'admin',
    email: 'admin@tictactoang.com',
    password: await hash('Admin@1234'),
    country: 'Vietnam',
    role: 'admin',
    accountStatus: 'active',
  });

  const playerA = await User.create({
    username: 'PlayerA',
    email: 'playera@tictactoang.com',
    password: await hash('PlayerA@123'),
    country: 'Vietnam',
    role: 'player',
    premiumStatus: true,
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    accountStatus: 'active',
    avatar: '/uploads/avatars/seed-player-a.png',
  });

  const playerB = await User.create({
    username: 'PlayerB',
    email: 'playerb@tictactoang.com',
    password: await hash('PlayerB@123'),
    country: 'Australia',
    role: 'player',
    premiumStatus: false,
    accountStatus: 'active',
    avatar: '/uploads/avatars/seed-player-b.png',
  });

  // ── Plans ──────────────────────────────────────────────────────────────────
  const goldPlan = await Plan.create({
    planId: 'monthly-gold',
    name: 'Gold Monthly',
    price: 10,
    currency: 'USD',
    durationDays: 30,
    features: ['Online multiplayer', 'Game replay', 'Custom markers', 'Priority matchmaking'],
    active: true,
  });

  await Plan.create({
    planId: 'monthly-standard',
    name: 'Standard Monthly',
    price: 5,
    currency: 'USD',
    durationDays: 30,
    features: ['Online multiplayer', 'Custom markers'],
    active: true,
  });

  // ── Subscription + Payment for Player A ────────────────────────────────────
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await Payment.create({
    userId: playerA._id,
    planId: goldPlan.planId,
    amount: goldPlan.price,
    currency: goldPlan.currency,
    paymentMethod: 'wallet',
    status: 'success',
    gatewayRef: 'GW-SEED-001',
    idempotencyKey: 'seed-playerA-sub-001',
  });

  await Subscription.create({
    userId: playerA._id,
    planId: goldPlan.planId,
    status: 'active',
    endDate,
    idempotencyKey: 'seed-playerA-sub-001',
  });

  // ── Sample completed game ──────────────────────────────────────────────────
  const board = Array(100).fill('');
  // Seed a fake 5-in-a-row win for PlayerA
  [0, 1, 2, 3, 4].forEach((c) => { board[c] = 'X'; });
  [10, 11, 12, 13].forEach((c) => { board[c] = 'O'; });

  await GameSession.create({
    gameType:    'local',
    boardSize:   10,
    board,
    player1:     playerA._id,
    player2:     playerB._id,
    mark1:       'X',
    mark2:       'O',
    currentTurn: playerA._id,
    status:      'completed',
    winner:      playerA._id,
    startTime:   new Date(Date.now() - 600000),
    endTime:     new Date(Date.now() - 300000),
    moves: [
      { player: playerA._id, row: 0, col: 0, mark: 'X' },
      { player: playerB._id, row: 1, col: 0, mark: 'O' },
      { player: playerA._id, row: 0, col: 1, mark: 'X' },
      { player: playerB._id, row: 1, col: 1, mark: 'O' },
      { player: playerA._id, row: 0, col: 2, mark: 'X' },
      { player: playerB._id, row: 1, col: 2, mark: 'O' },
      { player: playerA._id, row: 0, col: 3, mark: 'X' },
      { player: playerB._id, row: 1, col: 3, mark: 'O' },
      { player: playerA._id, row: 0, col: 4, mark: 'X' },
    ],
  });

  console.log('\n✅ Seed complete!\n');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│           GOLD DATA SET ACCOUNTS         │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│  Admin   admin@tictactoang.com           │');
  console.log('│          password: Admin@1234            │');
  console.log('│                                          │');
  console.log('│  PlayerA playera@tictactoang.com         │');
  console.log('│          password: PlayerA@123 (premium) │');
  console.log('│                                          │');
  console.log('│  PlayerB playerb@tictactoang.com         │');
  console.log('│          password: PlayerB@123           │');
  console.log('└─────────────────────────────────────────┘\n');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
