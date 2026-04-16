import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
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
      enum: ['player', 'admin'],
      default: 'player',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isPremium:           { type: Boolean, default: false },
    failedLoginAttempts: { type: Number,  default: 0 },
    lockUntil:           { type: Date,    default: null },
    lastLoginAt:         { type: Date,    default: null },
    avatar:              { type: String,  default: '' },
  },
  { timestamps: true, collection: 'users' }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
