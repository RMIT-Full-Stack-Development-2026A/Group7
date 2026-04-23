const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../auth/auth.model')

const profileSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'profile_settings' }
)

const mailboxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    from: { type: String, required: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'profile_mailbox' }
)

const ProfileSettings = mongoose.models.ProfileSettings || mongoose.model('ProfileSettings', profileSettingsSchema)
const MailboxMessage = mongoose.models.MailboxMessage || mongoose.model('MailboxMessage', mailboxSchema)

const DEFAULT_PROFILE_IDENTIFIER = 'admin'
const DEFAULT_PROFILE_NAME = 'The One Who Asked'

const buildDefaultProfile = async () => {
  const existing = await User.findOne({
    $or: [
      { username: DEFAULT_PROFILE_IDENTIFIER },
      { email: 'theonewhoasked@example.com' },
    ],
  })

  if (existing) {
    if (existing.username !== DEFAULT_PROFILE_IDENTIFIER) {
      existing.username = DEFAULT_PROFILE_IDENTIFIER
    }

    if (!existing.name) {
      existing.name = DEFAULT_PROFILE_NAME
    }

    if (existing.isModified()) {
      await existing.save()
    }

    return existing
  }

  const password = await bcrypt.hash('Password123!', 12)
  return User.create({
    name: DEFAULT_PROFILE_NAME,
    username: DEFAULT_PROFILE_IDENTIFIER,
    email: 'theonewhoasked@example.com',
    password,
    country: 'Vietnam',
    role: 'admin',
    isPremium: true,
    accountStatus: 'active',
    avatar: 'Mambo.png',
  })
}

const buildDefaultSettings = (userId) => ({
  userId,
  theme: 'dark',
  notifications: true,
  soundEnabled: true,
  language: 'en',
  twoFactorEnabled: false,
})

const buildDefaultMailbox = (userId) => ([
  {
    userId,
    from: 'system',
    subject: 'Welcome',
    message: 'Welcome to the game!',
    read: false,
  },
  {
    userId,
    from: 'friend',
    subject: 'Invite',
    message: "Let's play!",
    read: false,
  },
])

const ensureProfileSeedData = async () => {
  const user = await buildDefaultProfile()

  const existingSettings = await ProfileSettings.findOne({ userId: user._id })
  if (!existingSettings) {
    await ProfileSettings.create(buildDefaultSettings(user._id))
  }

  const mailboxCount = await MailboxMessage.countDocuments({ userId: user._id })
  if (!mailboxCount) {
    await MailboxMessage.insertMany(buildDefaultMailbox(user._id))
  }

  return user
}

module.exports = {
  User,
  ProfileSettings,
  MailboxMessage,
  DEFAULT_PROFILE_IDENTIFIER,
  buildDefaultProfile,
  buildDefaultSettings,
  buildDefaultMailbox,
  ensureProfileSeedData,
}
