const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, index: true },
  players: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, username: String, avatarUrl: String }],
  startTime: Date,
  endTime: Date,
  result: { type: String, enum: ['Player1','Player2','Draw','Aborted','Pending'], default: 'Pending' },
  moves: { type: [String], default: [] }, // algebraic notation
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
