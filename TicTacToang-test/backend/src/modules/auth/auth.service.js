import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import * as repo from './auth.repository.js'
import { registerResponseDTO, loginResponseDTO } from './auth.dto.js'

export const getAllUsers = async () =>
  repo.findAllUsers()

export const register = async ({ username, email, password, country }) => {
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
  const user   = await repo.createUser({ username, email, password: hashed, country })
  return registerResponseDTO(user)
}

export const login = async (identifier, password) => {
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
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  return loginResponseDTO(user, token)
}
