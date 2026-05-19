require('dotenv').config()

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/modules/auth/auth.model')
const Gameroom = require('../src/modules/gameroom/gameroom.model')

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const DB_NAME = process.env.MONGODB_DB_NAME || 'tictactoang'

const SEED_USERS = [
  {
    _id: '69e3435ceff30e9ad1367f2b',
    name: 'Admin',
    username: 'admin',
    email: 'admin@tictactoang.com',
    plainPassword: 'Admin@1234',
    country: 'Vietnam',
    role: 'admin',
    accountStatus: 'active',
    isPremium: false,
  },
  {
    _id: '69e3435ceff30e9ad1367f2c',
    name: 'PlayerA',
    username: 'PlayerA',
    email: 'playera@tictactoang.com',
    plainPassword: 'PlayerA@123',
    country: 'Vietnam',
    role: 'player',
    accountStatus: 'active',
    isPremium: true,
    subscriptionEndDate: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    _id: '69e3435ceff30e9ad1367f2d',
    name: 'PlayerB',
    username: 'PlayerB',
    email: 'playerb@tictactoang.com',
    plainPassword: 'PlayerB@123',
    country: 'Australia',
    role: 'player',
    accountStatus: 'active',
    isPremium: false,
  },
]

const LEGACY_SEED_USERS = [
  {
    _id: '69e3435ceff30e9ad1367f2b',
    username: 'admin',
    email: 'theonewhoasked@example.com',
  },
]

const legacySeedEmails = LEGACY_SEED_USERS.map((user) => user.email)

const buildSeedUser = async (seedUser) => {
  const { plainPassword, subscriptionEndDate, ...user } = seedUser

  return {
    ...user,
    password: await bcrypt.hash(plainPassword, 12),
    subscriptionEndDate: typeof subscriptionEndDate === 'function' ? subscriptionEndDate() : subscriptionEndDate,
    failedLoginAttempts: 0,
    lockUntil: null,
    lastLoginAt: null,
  }
}

async function seedAuthUsers() {
  await User.deleteMany({ email: { $in: legacySeedEmails } })

  const users = await Promise.all(SEED_USERS.map(async (seedUser) => {
    const nextUser = await buildSeedUser(seedUser)
    const existingUser = await User.findOne({
      $or: [
        { _id: seedUser._id },
        { email: seedUser.email },
        { username: seedUser.username },
      ],
    })

    if (!existingUser) {
      return User.create(nextUser)
    }

    Object.assign(existingUser, {
      name: nextUser.name,
      username: nextUser.username,
      email: nextUser.email,
      password: nextUser.password,
      country: nextUser.country,
      role: nextUser.role,
      accountStatus: nextUser.accountStatus,
      isPremium: nextUser.isPremium,
      subscriptionEndDate: nextUser.subscriptionEndDate || null,
      failedLoginAttempts: 0,
      lockUntil: null,
    })

    return existingUser.save()
  }))

  const validUserIds = new Set((await User.find({}, { _id: 1 }).lean()).map((user) => String(user._id)))
  const rooms = await Gameroom.find({}, { _id: 1, host: 1 }).lean()
  const orphanRoomIds = rooms
    .filter((room) => room.host && !validUserIds.has(String(room.host)))
    .map((room) => room._id)

  if (orphanRoomIds.length) {
    await Gameroom.deleteMany({ _id: { $in: orphanRoomIds } })
  }

  console.log(`Seeded auth users: ${users.map((user) => user.email).join(', ')}`)
}

async function runStandaloneSeed() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)

  await seedAuthUsers()

  console.log('')
  console.log('Seed complete.')
  console.log('Admin   -> admin@tictactoang.com / Admin@1234')
  console.log('PlayerA -> playera@tictactoang.com / PlayerA@123')
  console.log('PlayerB -> playerb@tictactoang.com / PlayerB@123')

  await mongoose.disconnect()
}

if (require.main === module) {
  runStandaloneSeed().catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
}

module.exports = {
  seedAuthUsers,
}
