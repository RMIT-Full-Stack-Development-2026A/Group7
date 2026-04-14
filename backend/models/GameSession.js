const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema(
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
  { timestamps: true }
);

module.exports = mongoose.model('GameSession', gameSessionSchema);
