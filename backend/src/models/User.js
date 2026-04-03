const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:            { type: String, required: true, unique: true, trim: true },
  email:               { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:            { type: String, required: true },
  country:             { type: String, required: true },
  role:                { type: String, enum: ['player', 'admin'], default: 'player' },
  avatar:              { type: String, default: null },
  premiumStatus:       { type: Boolean, default: false },
  subscriptionEndDate: { type: Date, default: null },
  accountStatus:       { type: String, enum: ['active', 'banned'], default: 'active' },
  loginAttempts:       { type: Number, default: 0 },
  lockUntil:           { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
