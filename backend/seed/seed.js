/**
 * TicTacToang — Gold Data Set Seed
 * ─────────────────────────────────
 * Run from the backend folder:
 *   node seed/seed.js
 *
 * Or via npm script (after adding to package.json):
 *   npm run seed
 *
 * Creates three accounts every time (wipes existing seed accounts first):
 *   Admin   → goes to /admin after login
 *   PlayerA → premium account
 *   PlayerB → standard account
 */

require('dotenv').config()     // picks up .env in backend/
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')         // app-test uses bcryptjs

// ── Model ─────────────────────────────────────────────────────────────────────
// Must match auth.model.js exactly:
//   password  (not passwordHash)
//   accountStatus  (not isActive)
//   isPremium  (not premiumStatus)
const User = require('../src/modules/auth/auth.model')

// ── DB connection — same env vars as db.js ────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI     || 'mongodb://127.0.0.1:27017'
const DB_NAME   = process.env.MONGODB_DB_NAME || 'tictactoang'

async function seed() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  console.log(`\n🔌 Connected → ${mongoose.connection.host}/${mongoose.connection.name}`)

  // ── Wipe existing seed accounts only (leave other data untouched) ──────────
  const seedEmails = [
    'admin@tictactoang.com',
    'playera@tictactoang.com',
    'playerb@tictactoang.com',
  ]
  const seedUsernames = ['admin', 'PlayerA', 'PlayerB']

  await User.deleteMany({
    $or: [
      { email: { $in: seedEmails } },
      { username: { $in: seedUsernames } },
    ],
  })

  const ROUNDS = 12

  // ── Admin ─────────────────────────────────────────────────────────────────
  await User.create({
    name:          'Admin',
    username:      'admin',
    email:         'admin@tictactoang.com',
    password:      await bcrypt.hash('Admin@1234', ROUNDS),
    country:       'Vietnam',
    role:          'admin',           // AdminOnlyLayout checks this
    accountStatus: 'active',
    isPremium:     false,
  })

  // ── Player A — premium ────────────────────────────────────────────────────
  await User.create({
    name:                'PlayerA',
    username:            'PlayerA',
    email:               'playera@tictactoang.com',
    password:            await bcrypt.hash('PlayerA@123', ROUNDS),
    country:             'Vietnam',
    role:                'player',
    accountStatus:       'active',
    isPremium:           true,
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  // ── Player B — standard ───────────────────────────────────────────────────
  await User.create({
    name:          'PlayerB',
    username:      'PlayerB',
    email:         'playerb@tictactoang.com',
    password:      await bcrypt.hash('PlayerB@123', ROUNDS),
    country:       'Australia',
    role:          'player',
    accountStatus: 'active',
    isPremium:     false,
  })

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n')
  console.log('┌─────────────────────────────────────────────────────────┐')
  console.log('│                  GOLD DATA SET ACCOUNTS                  │')
  console.log('├──────────┬───────────────────────────┬──────────────────┤')
  console.log('│ Role     │ Email                     │ Password         │')
  console.log('├──────────┼───────────────────────────┼──────────────────┤')
  console.log('│ admin    │ admin@tictactoang.com     │ Admin@1234       │')
  console.log('│ player   │ playera@tictactoang.com   │ PlayerA@123      │')
  console.log('│ player   │ playerb@tictactoang.com   │ PlayerB@123      │')
  console.log('└──────────┴───────────────────────────┴──────────────────┘')
  console.log('\nAdmin login → redirects directly to /admin panel.')
  console.log('Players    → redirects to /main-menu.\n')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
