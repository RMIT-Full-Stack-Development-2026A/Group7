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
const DEFAULT_PROFILE_NAME = 'Admin'
const DEFAULT_PROFILE_EMAIL = 'admin@tictactoang.com'
const DEFAULT_PROFILE_PASSWORD = 'Admin@1234'
const LEGACY_DEFAULT_PROFILE_AVATAR = 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
const DEFAULT_PROFILE_AVATAR = 'Mambo.png'
const DEFAULT_PROFILE_COUNTRY = 'Vietnam'
const DEFAULT_PROFILE_ROLE = 'admin'
const DEFAULT_PROFILE_STATUS = 'active'
const DEFAULT_PROFILE_PREMIUM = false

const buildDefaultProfile = async () => {
  const existing = await User.findOne({
    $or: [
      { username: DEFAULT_PROFILE_IDENTIFIER },
      { email: DEFAULT_PROFILE_EMAIL },
    ],
  })

  if (existing) {
    if (existing.username !== DEFAULT_PROFILE_IDENTIFIER) {
      existing.username = DEFAULT_PROFILE_IDENTIFIER
    }

    if (!existing.name) {
      existing.name = DEFAULT_PROFILE_NAME
    }

    if (existing.email !== DEFAULT_PROFILE_EMAIL) {
      existing.email = DEFAULT_PROFILE_EMAIL
    }

    if (
      !existing.avatar
      || existing.avatar === 'Mambo.png'
      || existing.avatar === LEGACY_DEFAULT_PROFILE_AVATAR
    ) {
      existing.avatar = DEFAULT_PROFILE_AVATAR
    }

    const passwordMatches = await bcrypt.compare(DEFAULT_PROFILE_PASSWORD, existing.password)
    if (!passwordMatches) {
      existing.password = await bcrypt.hash(DEFAULT_PROFILE_PASSWORD, 12)
      existing.failedLoginAttempts = 0
      existing.lockUntil = null
    }

    existing.country = DEFAULT_PROFILE_COUNTRY
    existing.role = DEFAULT_PROFILE_ROLE
    existing.accountStatus = DEFAULT_PROFILE_STATUS
    existing.isPremium = DEFAULT_PROFILE_PREMIUM

    if (existing.isModified()) {
      await existing.save()
    }

    return existing
  }

  const password = await bcrypt.hash(DEFAULT_PROFILE_PASSWORD, 12)
  return User.create({
    name: DEFAULT_PROFILE_NAME,
    username: DEFAULT_PROFILE_IDENTIFIER,
    email: DEFAULT_PROFILE_EMAIL,
    password,
    country: DEFAULT_PROFILE_COUNTRY,
    role: DEFAULT_PROFILE_ROLE,
    isPremium: DEFAULT_PROFILE_PREMIUM,
    accountStatus: DEFAULT_PROFILE_STATUS,
    avatar: DEFAULT_PROFILE_AVATAR,
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
  DEFAULT_PROFILE_AVATAR,
  buildDefaultProfile,
  buildDefaultSettings,
  buildDefaultMailbox,
  ensureProfileSeedData,
}
