const User = require('./auth.model')

const findAllUsers = () =>
  User.find().sort({ createdAt: -1 }).lean()

const findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() })

const findByUsername = (username) =>
  User.findOne({ username: username.trim() })

const findByEmailOrUsername = (identifier) =>
  User.findOne({
    $or: [
      { email: identifier.toLowerCase().trim() },
      { username: identifier.trim() },
    ],
  })

const findById = (id) =>
  User.findById(id).select('-password')

const createUser = (data) =>
  User.create(data)

const updateLoginSuccess = (userId) =>
  User.findByIdAndUpdate(
    userId,
    { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
    { new: true }
  )

const incrementFailedAttempts = async (userId) => {
  const user = await User.findById(userId)
  if (!user) return
  const attempts = user.failedLoginAttempts + 1
  const update = { failedLoginAttempts: attempts }
  if (attempts >= 5) update.lockUntil = new Date(Date.now() + 60 * 1000)
  return User.findByIdAndUpdate(userId, update, { new: true })
}

module.exports = {
  findAllUsers,
  findByEmail,
  findByUsername,
  findByEmailOrUsername,
  findById,
  createUser,
  updateLoginSuccess,
  incrementFailedAttempts,
}
