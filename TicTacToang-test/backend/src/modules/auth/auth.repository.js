import User from './auth.model.js'

export const findAllUsers = () =>
  User.find().sort({ createdAt: -1 }).lean()

export const findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() })

export const findByUsername = (username) =>
  User.findOne({ username: username.trim() })

export const findByEmailOrUsername = (identifier) =>
  User.findOne({
    $or: [
      { email: identifier.toLowerCase().trim() },
      { username: identifier.trim() },
    ],
  })

export const findById = (id) =>
  User.findById(id).select('-password')

export const createUser = (data) =>
  User.create(data)

export const updateLoginSuccess = (userId) =>
  User.findByIdAndUpdate(
    userId,
    { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
    { new: true }
  )

export const incrementFailedAttempts = async (userId) => {
  const user = await User.findById(userId)
  if (!user) return
  const attempts = user.failedLoginAttempts + 1
  const update   = { failedLoginAttempts: attempts }
  if (attempts >= 5) update.lockUntil = new Date(Date.now() + 60 * 1000)
  return User.findByIdAndUpdate(userId, update, { new: true })
}
