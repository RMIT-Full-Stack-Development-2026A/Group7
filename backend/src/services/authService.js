const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const userRepo = require('../repositories/userRepository');

async function register({ username, email, password, country }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
  const user = await userRepo.createUser({ username, email, passwordHash, country });
  return { id: user._id, username: user.username, email: user.email };
}

async function login({ usernameOrEmail, password }) {
  // allow login by email or username
  let user = await userRepo.findByEmail(usernameOrEmail);
  if (!user) {
    // try username
    user = await require('../models/User').findOne({ username: usernameOrEmail }).lean();
  }
  if (!user) throw new Error('Invalid credentials');
  if (!user.isActive) throw new Error('Account deactivated');
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('Invalid credentials');
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return { token, user: { id: user._id, username: user.username, email: user.email, role: user.role } };
}

module.exports = { register, login };
