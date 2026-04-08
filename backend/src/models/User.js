const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  country: { type: String },
  role: { type: String, enum: ['player','admin'], default: 'player' },
  premiumStatus: { type: Boolean, default: false },
  subscriptionEndDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  avatarUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
