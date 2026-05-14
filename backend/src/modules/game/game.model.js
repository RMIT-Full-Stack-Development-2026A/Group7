// game.model.js
const mongoose = require('mongoose');

/**
 * Move Schema - Embedded document for each move
 * Stores individual moves for replay functionality
 */
const MoveSchema = new mongoose.Schema({
  moveNumber: {
    type: Number,
    required: true,
    min: 1
  },
  player: {
    type: String,
    enum: ['X', 'O', 'P1', 'P2', 'P3', 'P4'],
    required: true
  },
  row: {
    type: Number,
    required: true,
    min: 0
  },
  col: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number,
    default: 0
  }
});

/**
 * Game Result Schema
 */
const GameResultSchema = new mongoose.Schema({
  winner: {
    type: String,
    enum: ['X', 'O', 'P1', 'P2', 'P3', 'P4', 'draw', null],
    default: null
  },
  winReason: {
    type: String,
    enum: ['five_in_row', 'timeout', 'resignation', 'draw_agreement', null],
    default: null
  },
  winningTiles: [{
    row: Number,
    col: Number
  }],
  totalMoves: {
    type: Number,
    default: 0
  }
});

/**
 * Player Stats Schema - Embedded in game
 */
const PlayerGameStatsSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true
  },
  playerSymbol: {
    type: String,
    enum: ['X', 'O'],
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  playerRank: {
    type: Number,
    default: 1200
  },
  totalTimeUsed: {
    type: Number,
    default: 0
  },
  isAI: {
    type: Boolean,
    default: false
  },
  aiDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', null],
    default: null
  }
});

const GameParticipantSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  playerName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  playerSymbol: {
    type: String,
    default: ''
  },
  marker: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 1
  },
  isAI: {
    type: Boolean,
    default: false
  },
  aiDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', null],
    default: null
  }
}, { _id: false });

/**
 * Main Game Schema
 */
const GameSchema = new mongoose.Schema({
  // Game identifiers
  gameId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Game configuration
  boardSize: {
    type: Number,
    enum: [10, 15],
    required: true,
    default: 15
  },
  gameMode: {
    type: String,
    enum: ['singleplayer', 'multiplayer', 'local'],
    required: true
  },
  timeControl: {
    type: Number,
    default: 60,
    min: 30,
    max: 300
  },
  
  // Players
  players: {
    X: PlayerGameStatsSchema,
    O: PlayerGameStatsSchema
  },
  participants: {
    type: [GameParticipantSchema],
    default: []
  },
  
  // Game state
  currentTurn: {
    type: String,
    enum: ['X', 'O', 'P1', 'P2', 'P3', 'P4'],
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting'
  },
  
  // Moves history (for replay)
  moves: [MoveSchema],
  
  // Result
  result: GameResultSchema,
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastMoveAt: {
    type: Date,
    default: Date.now
  },
  
  // Security & Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
GameSchema.index({ status: 1, createdAt: -1 });
GameSchema.index({ 'players.X.playerId': 1, status: 1 });
GameSchema.index({ 'players.O.playerId': 1, status: 1 });
GameSchema.index({ completedAt: -1 });
GameSchema.index({ gameId: 1 });

// Virtual: Get player by symbol
GameSchema.virtual('getPlayer').get(function(symbol) {
  return this.players[symbol];
});

// Virtual: Check if game is a draw
GameSchema.virtual('isDraw').get(function() {
  return this.result && this.result.winner === 'draw';
});

// Virtual: Game duration in seconds
GameSchema.virtual('duration').get(function() {
  if (!this.completedAt) return null;
  return Math.round((this.completedAt - this.startedAt) / 1000);
});

// Pre-save middleware
GameSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Instance method: Add a move
GameSchema.methods.addMove = async function(moveData) {
  this.moves.push(moveData);
  this.lastMoveAt = new Date();
  this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
  this.result.totalMoves = this.moves.length;
  return this.save();
};

// Instance method: Complete game
GameSchema.methods.completeGame = async function(winner, winReason, winningTiles = []) {
  this.status = 'completed';
  this.result = {
    winner: winner,
    winReason: winReason,
    winningTiles: winningTiles,
    totalMoves: this.moves.length
  };
  this.completedAt = new Date();
  return this.save();
};

// Instance method: Check if player is in game
GameSchema.methods.isPlayerInGame = function(userId) {
  const xId = this.players.X.playerId ? this.players.X.playerId.toString() : null;
  const oId = this.players.O.playerId ? this.players.O.playerId.toString() : null;
  const targetId = userId.toString();
  return xId === targetId || oId === targetId;
};

// Instance method: Get opponent
GameSchema.methods.getOpponent = function(userId) {
  const targetId = userId.toString();
  if (this.players.X.playerId && this.players.X.playerId.toString() === targetId) {
    return this.players.O;
  }
  if (this.players.O.playerId && this.players.O.playerId.toString() === targetId) {
    return this.players.X;
  }
  return null;
};

// Static method: Find active games for user
GameSchema.statics.findActiveGamesByUser = async function(userId) {
  return this.find({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId }
    ],
    status: { $in: ['waiting', 'active'] }
  }).sort({ lastMoveAt: -1 });
};

// Static method: Find completed games for user (for history)
GameSchema.statics.findHistoryByUser = async function(userId, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId }
    ],
    status: 'completed'
  })
  .sort({ completedAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Prevent model re-compilation error in development
module.exports = mongoose.models.Game || mongoose.model('Game', GameSchema);
