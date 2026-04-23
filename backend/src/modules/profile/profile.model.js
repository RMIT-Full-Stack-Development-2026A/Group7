const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../auth/auth.model')
const { users } = require('../../seed')

const { admin: defaultAdmin } = users

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

const DEFAULT_PROFILE_IDENTIFIER = defaultAdmin.username
const DEFAULT_PROFILE_NAME = defaultAdmin.name
const DEFAULT_PROFILE_EMAIL = defaultAdmin.email
const LEGACY_DEFAULT_PROFILE_AVATAR = 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
const DEFAULT_PROFILE_AVATAR = defaultAdmin.avatar

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

    const passwordMatches = await bcrypt.compare(defaultAdmin.loginPassword, existing.password)
    if (!passwordMatches) {
      existing.password = await bcrypt.hash(defaultAdmin.loginPassword, 12)
      existing.failedLoginAttempts = defaultAdmin.failedLoginAttempts
      existing.lockUntil = defaultAdmin.lockUntil
    }

    existing.country = defaultAdmin.country
    existing.role = defaultAdmin.role
    existing.accountStatus = defaultAdmin.accountStatus
    existing.isPremium = defaultAdmin.isPremium

    if (existing.isModified()) {
      await existing.save()
    }

    return existing
  }

  const password = await bcrypt.hash(defaultAdmin.loginPassword, 12)
  return User.create({
    _id: defaultAdmin._id,
    name: DEFAULT_PROFILE_NAME,
    username: DEFAULT_PROFILE_IDENTIFIER,
    email: DEFAULT_PROFILE_EMAIL,
    password,
    country: defaultAdmin.country,
    role: defaultAdmin.role,
    isPremium: defaultAdmin.isPremium,
    accountStatus: defaultAdmin.accountStatus,
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
