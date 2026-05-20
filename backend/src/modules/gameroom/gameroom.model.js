const mongoose = require('mongoose')

// Marker IDs are free-form strings — single icons like 'X', 'Circle' (new flow)
// or legacy pair codes like 'X-O' for rooms created before the per-player picker.
const gameroomSchema = new mongoose.Schema(
  {
    roomId: {
      type: Number,
      required: true,
      unique: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      enum: [2, 3],
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    players: [
      {
        userId: String,
        name: String,
        avatar: String,
        type: {
          type: String,
          enum: ['human', 'ai'],
          default: 'human',
        },
        aiDifficulty: {
          type: String,
          enum: ['Easy', 'Medium', 'Hard'],
        },
        // Single-icon marker chosen by this individual player (e.g. 'X', 'Circle').
        // Duplicates across players are allowed; render layer differentiates by color.
        marker: {
          type: String,
          default: '',
        },
        markerColor: {
          type: String,
          default: '',
        },
      },
    ],
    chatMessages: [
      {
        id: String,
        senderId: String,
        senderName: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    gameSettings: {
      boardStyle: {
        type: String,
        enum: ['Classic', 'Modern', 'Minimal'],
        default: 'Classic',
      },
      boardSize: {
        type: String,
        enum: ['10x10', '15x15'],
        default: '10x10',
      },
      marker: {
        type: String,
        default: 'X',
      },
      timeToThink: {
        type: Number,
        default: 60,
      },
      gameMode: {
        type: String,
        default: 'classic',
      },
      hostPosition: {
        type: Number,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ['available', 'full', 'in-battle', 'completed'],
      default: 'available',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: 'gameroom' }
)

const Gameroom = mongoose.models.Room || mongoose.model('Room', gameroomSchema)

module.exports = Gameroom
