const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scores: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true, collection: 'games' }
)

const Game = mongoose.models.GameSession || mongoose.model('GameSession', gameSchema)

module.exports = Game
