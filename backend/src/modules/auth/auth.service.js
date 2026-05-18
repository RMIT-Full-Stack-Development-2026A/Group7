const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const repo = require('./auth.repository')
const { registerResponseDTO, loginResponseDTO } = require('./auth.dto')

const getAllUsers = async () =>
  repo.findAllUsers()

const register = async ({ name, username, email, password, country }) => {
  if (await repo.findByEmail(email)) {
    const err = new Error('Email already exists.')
    err.statusCode = 409
    throw err
  }
  if (await repo.findByUsername(username)) {
    const err = new Error('Username already taken.')
    err.statusCode = 409
    throw err
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await repo.createUser({
    name: name?.trim() || username.trim(),
    username,
    email,
    password: hashed,
    country,
  })
  return registerResponseDTO(user)
}

const login = async (identifier, password) => {
  const user = await repo.findByEmailOrUsername(identifier)
  if (!user) {
    const err = new Error('Invalid username/email or password.')
    err.statusCode = 400
    throw err
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const secondsLeft = Math.ceil((user.lockUntil - Date.now()) / 1000)
    const err = new Error(`Account locked. Try again in ${secondsLeft}s.`)
    err.statusCode = 403
    err.locked = true
    err.secondsLeft = secondsLeft
    throw err
  }

  if (user.timeoutUntil && user.timeoutUntil > new Date()) {
    const secondsLeft = Math.ceil((user.timeoutUntil - Date.now()) / 1000)
    const err = new Error(`Account timed out. Try again in ${secondsLeft}s.`)
    err.statusCode = 403
    err.locked = true
    err.secondsLeft = secondsLeft
    throw err
  }

  if (user.accountStatus === 'inactive') {
    const err = new Error('Account deactivated. Contact support.')
    err.statusCode = 403
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    await repo.incrementFailedAttempts(user._id)
    const updated = await repo.findByEmailOrUsername(identifier)
    if (updated?.lockUntil && updated.lockUntil > new Date()) {
      const secondsLeft = Math.ceil((updated.lockUntil - Date.now()) / 1000)
      const err = new Error(`Too many attempts. Locked for ${secondsLeft}s.`)
      err.statusCode = 403
      err.locked = true
      err.secondsLeft = secondsLeft
      throw err
    }
    const err = new Error('Invalid username/email or password.')
    err.statusCode = 400
    throw err
  }

  await repo.updateLoginSuccess(user._id)

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  return loginResponseDTO(user, token)
}

const User = require('./auth.model')

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const fullUser = await User.findById(userId)
  if (!fullUser) {
    const err = new Error('User not found.')
    err.statusCode = 404
    throw err
  }

  const isMatch = await bcrypt.compare(oldPassword, fullUser.password)
  if (!isMatch) {
    const err = new Error('Current password is incorrect.')
    err.statusCode = 400
    err.errors = { oldPassword: 'Current password is incorrect.' }
    throw err
  }

  const sameAsOld = await bcrypt.compare(newPassword, fullUser.password)
  if (sameAsOld) {
    const err = new Error('New password must be different from the current password.')
    err.statusCode = 400
    err.errors = { newPassword: 'New password must be different from the current password.' }
    throw err
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await repo.updatePassword(userId, hashed)
  return true
}

module.exports = {
  getAllUsers,
  register,
  login,
  changePassword,
}
