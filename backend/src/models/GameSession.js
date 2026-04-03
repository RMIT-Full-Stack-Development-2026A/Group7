const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const moveSchema = new mongoose.Schema({
  player:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  row:       Number,
  col:       Number,
  mark:      String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
  roomId:      { type: String, default: uuidv4, unique: true },
  gameType:    { type: String, enum: ['local', 'online'], required: true },
  boardSize:   { type: Number, default: 10 },
  board:       { type: [String], default: () => Array(100).fill('') },
  player1:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player2:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  player2Name: { type: String },   // local 2-player guest name
  mark1:       { type: String, default: 'X' },
  mark2:       { type: String, default: 'O' },
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  localTurn:   { type: String, enum: ['player1', 'player2'], default: 'player1' },
  status:      { type: String, enum: ['waiting', 'active', 'completed', 'draw', 'aborted'], default: 'active' },
  winner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  moves:       [moveSchema],
  startTime:   { type: Date, default: Date.now },
  endTime:     { type: Date },
}, { timestamps: true });

gameSessionSchema.index({ roomId: 1 });
gameSessionSchema.index({ player1: 1 });
gameSessionSchema.index({ player2: 1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);