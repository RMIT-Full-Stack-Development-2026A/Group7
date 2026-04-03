const bcrypt = require('bcryptjs');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const User = require('../../../models/User');
const GameSession = require('../../../models/GameSession');

async function getProfile(userId) {
  const user = await User.findById(userId).select('-password -loginAttempts -lockUntil');
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }
  return user;
}

async function updateProfile(userId, { username, email, password, country }) {
  const user = await User.findById(userId);
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }

  if (username && username !== user.username) {
    const taken = await User.findOne({ username });
    if (taken) { const e = new Error('Username already taken'); e.status = 409; throw e; }
    user.username = username;
  }
  if (email && email !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) { const e = new Error('Email already in use'); e.status = 409; throw e; }
    user.email = email.toLowerCase();
  }
  if (country) user.country = country;
  if (password) user.password = await bcrypt.hash(password, 12);

  await user.save();
  const u = user.toObject();
  delete u.password; delete u.loginAttempts; delete u.lockUntil;
  return u;
}

async function saveAvatar(userId, file) {
  // Resize to 200x200 using sharp
  const outputDir  = path.join(__dirname, '../../../../uploads/avatars');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, `avatar-${userId}.webp`);

  await sharp(file.path).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toFile(outputFile);
  // Remove original upload
  fs.unlinkSync(file.path);

  const avatarUrl = `/uploads/avatars/avatar-${userId}.webp`;
  await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
  return { avatar: avatarUrl };
}

async function getGameHistory(userId) {
  return GameSession.find({
    $or: [{ player1: userId }, { player2: userId }],
    status: { $ne: 'waiting' },
  })
    .select('roomId gameType boardSize status winner player1 player2 player2Name startTime endTime mark1 mark2')
    .populate('player1', 'username avatar')
    .populate('player2', 'username avatar')
    .sort({ startTime: -1 })
    .lean();
}

module.exports = { getProfile, updateProfile, saveAvatar, getGameHistory };
