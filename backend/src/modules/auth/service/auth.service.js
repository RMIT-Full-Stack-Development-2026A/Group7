const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const { revoke } = require('../../../config/tokenStore');

const LOCK_WINDOW_MS  = 60 * 1000; // 1 min
const MAX_ATTEMPTS    = 5;

async function register({ username, email, password, country }) {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    const field = exists.email === email.toLowerCase() ? 'Email' : 'Username';
    const err = new Error(`${field} already in use`);
    err.status = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashed, country });
  return { message: 'Registered successfully', userId: user._id };
}

async function login({ usernameOrEmail, password }) {
  const user = await User.findOne({
    $or: [{ email: usernameOrEmail?.toLowerCase() }, { username: usernameOrEmail }],
  });

  if (!user) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }

  // Check ban
  if (user.accountStatus === 'banned') {
    const err = new Error('Account has been deactivated. Contact admin.'); err.status = 403; throw err;
  }

  // Check rate limit / lock
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const secs = Math.ceil((user.lockUntil - Date.now()) / 1000);
    const err = new Error(`Too many failed attempts. Try again in ${secs}s.`); err.status = 429; throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_WINDOW_MS);
      user.loginAttempts = 0;
    }
    await user.save();
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }

  // Reset attempts on success
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const payload = {
    userId:        user._id,
    username:      user.username,
    role:          user.role,
    premiumStatus: user.premiumStatus,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

  return { token, user: toDTO(user) };
}

async function logout(token, jwtPayload) {
  // Revoke token until its natural expiry
  const expiresAt = jwtPayload.exp ? jwtPayload.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
  revoke(token, expiresAt);
}

async function getMe(userId) {
  const user = await User.findById(userId).select('-password -loginAttempts -lockUntil');
  if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }
  return user;
}

function toDTO(user) {
  return {
    _id:                 user._id,
    username:            user.username,
    email:               user.email,
    country:             user.country,
    role:                user.role,
    avatar:              user.avatar,
    premiumStatus:       user.premiumStatus,
    subscriptionEndDate: user.subscriptionEndDate,
    accountStatus:       user.accountStatus,
  };
}

module.exports = { register, login, logout, getMe };
