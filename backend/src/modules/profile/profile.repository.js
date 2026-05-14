const mongoose = require('mongoose')
const {
  User,
  ProfileSettings,
  MailboxMessage,
  buildDefaultSettings,
  buildDefaultMailbox,
  ensureProfileSeedData,
} = require('./profile.model')

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null
  }

  return new mongoose.Types.ObjectId(value)
}

const findUserByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || '').trim()
  const objectId = toObjectId(normalizedIdentifier)

  const query = objectId
    ? {
        $or: [
          { _id: objectId },
          { username: normalizedIdentifier },
          { email: normalizedIdentifier.toLowerCase() },
        ],
      }
    : {
        $or: [
          { username: normalizedIdentifier },
          { email: normalizedIdentifier.toLowerCase() },
        ],
      }

  return User.findOne(query)
}

const ensureUserByIdentifier = async (identifier) => {
  const matchedUser = await findUserByIdentifier(identifier)

  if (!matchedUser) {
    const err = new Error('User not found.')
    err.statusCode = 404
    throw err
  }

  return matchedUser
}

const getProfileByUserId = async (userId) => {
  return ensureUserByIdentifier(userId)
}

const updateProfileByUserId = async (userId, updates) => {
  const user = await ensureUserByIdentifier(userId)
  const payload = {}

  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.email !== undefined) payload.email = updates.email.toLowerCase()
  if (updates.country !== undefined) payload.country = updates.country
  if (updates.role !== undefined) payload.role = updates.role
  if (updates.premiumStatus !== undefined) payload.isPremium = updates.premiumStatus
  if (updates.subscriptionEndDate !== undefined) payload.subscriptionEndDate = updates.subscriptionEndDate
  if (updates.isActive !== undefined) payload.accountStatus = updates.isActive ? 'active' : 'inactive'
  if (updates.avatarUrl !== undefined) payload.avatar = updates.avatarUrl
  if (updates.passwordHash !== undefined) payload.password = updates.passwordHash

  const updatedUser = await User.findByIdAndUpdate(user._id, payload, {
    new: true,
    runValidators: true,
  })

  return {
    success: true,
    user: updatedUser,
  }
}

const getSettingsByUserId = async (userId) => {
  const user = await ensureUserByIdentifier(userId)
  let settings = await ProfileSettings.findOne({ userId: user._id }).lean()

  if (!settings) {
    settings = await ProfileSettings.create(buildDefaultSettings(user._id))
    return settings.toObject()
  }

  return settings
}

const updateSettingsByUserId = async (userId, updates) => {
  const user = await ensureUserByIdentifier(userId)
  const settings = await ProfileSettings.findOneAndUpdate(
    { userId: user._id },
    {
      $set: updates,
      $setOnInsert: buildDefaultSettings(user._id),
    },
    { upsert: true, new: true, runValidators: true }
  )

  return {
    success: true,
    settings,
  }
}

const getMailboxByUserId = async (userId) => {
  const user = await ensureUserByIdentifier(userId)
  let messages = await MailboxMessage.find({ userId: user._id }).sort({ createdAt: -1 }).lean()

  if (!messages.length) {
    const inserted = await MailboxMessage.insertMany(buildDefaultMailbox(user._id))
    messages = inserted.map((message) => message.toObject())
  }

  return messages
}

const upsertSubscriptionByUserId = async (userId, subscriptionData) => {
  const user = await ensureUserByIdentifier(userId)
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      isPremium: Boolean(subscriptionData.premiumStatus),
      subscriptionEndDate: subscriptionData.subscriptionEndDate || null,
    },
    { new: true, runValidators: true }
  )
  const endDateText = subscriptionData.subscriptionEndDate
    ? new Date(subscriptionData.subscriptionEndDate).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'the next billing date'

  await MailboxMessage.create({
    userId: user._id,
    from: 'billing@tictactoang.local',
    subject: 'Premium subscription payment processed',
    message: `Your $10 USD monthly premium subscription payment was successfully processed. Premium access is active until ${endDateText}.`,
    read: false,
  })

  return {
    success: true,
    premiumStatus: Boolean(subscriptionData.premiumStatus),
    subscriptionEndDate: subscriptionData.subscriptionEndDate || null,
    user: updatedUser,
  }
}

module.exports = {
  getProfileByUserId,
  updateProfileByUserId,
  getSettingsByUserId,
  updateSettingsByUserId,
  getMailboxByUserId,
  upsertSubscriptionByUserId,
}
