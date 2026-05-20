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
    enum: ['X', 'O', 'P1', 'P2', 'P3'],
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
    enum: ['X', 'O', 'P1', 'P2', 'P3', 'draw', null],
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
    enum: ['X', 'O', 'P1', 'P2', 'P3'],
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

// Game duration in seconds — used by GameReplay/history DTOs.
GameSchema.virtual('duration').get(function () {
  if (!this.completedAt) return null;
  return Math.round((this.completedAt - this.startedAt) / 1000);
});

// Pre-save: stamp updatedAt and completedAt on completion.
GameSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Prevent model re-compilation error in development.
module.exports = mongoose.models.Game || mongoose.model('Game', GameSchema);
