const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Min 3 characters'],
      maxlength: [50, 'Max 50 characters'],
      default: function defaultName() {
        return this.username
      },
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Min 3 characters'],
      maxlength: [30, 'Max 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, _ and -'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Max 254 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['player', 'admin', 'moderator'],
      default: 'player',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isPremium: { type: Boolean, default: false },
    subscriptionEndDate: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400' },
  },
  { timestamps: true, collection: 'users' }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

module.exports = User
