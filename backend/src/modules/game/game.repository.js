// game.repository.js
const Game = require('./game.model');

/**
 * Find all games (with optional filters)
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - Query options (sort, limit, skip)
 */
const findAllGames = (filter = {}, options = {}) => {
  let query = Game.find(filter);
  
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  if (options.populate) query = query.populate(options.populate);
  
  return query;
};

/**
 * Find game by MongoDB _id
 * @param {string} id - MongoDB ObjectId
 */
const findByMongoId = (id) => Game.findById(id);

/**
 * Find game by custom gameId
 * @param {string} gameId - Custom game identifier
 */
const findByGameId = (gameId) => Game.findOne({ gameId });

/**
 * Find active games for a player
 * @param {string} userId - User ID
 */
const findActiveGamesByPlayer = (userId) => {
  return Game.find({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId },
      { 'participants.playerId': userId }
    ],
    status: { $in: ['waiting', 'active'] }
  }).sort({ lastMoveAt: -1 });
};

/**
 * Find completed games for a player (history)
 * @param {string} userId - User ID
 * @param {number} limit - Number of games to return
 * @param {number} skip - Number of games to skip (pagination)
 */
const findHistoryByPlayer = (userId, limit = 50, skip = 0, options = {}) => {
  const {
    filter = {},
    sortDirection = 'desc',
  } = options

  return Game.find({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId },
      { 'participants.playerId': userId }
    ],
    ...filter
  })
  .sort({ completedAt: sortDirection === 'asc' ? 1 : -1, startedAt: sortDirection === 'asc' ? 1 : -1 })
  .skip(skip)
  .limit(limit);
};

const countHistoryByPlayer = (userId, filter = {}) => (
  Game.countDocuments({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId },
      { 'participants.playerId': userId }
    ],
    ...filter
  })
);

/**
 * Find waiting games (available for matchmaking)
 * @param {string} excludeUserId - User ID to exclude (current player)
 * @param {number} boardSize - Preferred board size
 */
const findWaitingGames = (excludeUserId, boardSize = null) => {
  const filter = {
    status: 'waiting',
    gameMode: 'multiplayer',
    'players.X.isAI': false,
    'players.X.playerId': { $ne: excludeUserId }
  };
  
  if (boardSize) {
    filter.boardSize = boardSize;
  }
  
  return Game.find(filter).sort({ createdAt: 1 });
};

/**
 * Create a new game
 * @param {Object} gameData - Game data to create
 */
const createGame = async (gameData) => {
  const game = new Game(gameData);
  return await game.save();  // ← This actually saves to MongoDB
};

/**
 * Update game by custom gameId
 * @param {string} gameId - Custom game identifier
 * @param {Object} update - Update data
 * @param {Object} options - Additional options
 */
const updateGameByGameId = (gameId, update, options = {}) => {
  return Game.findOneAndUpdate({ gameId }, update, {
    new: true,
    runValidators: true,
    ...options
  });
};

/**
 * Add a move to game
 * @param {string} gameId - Custom game identifier
 * @param {Object} moveData - Move data { moveNumber, player, row, col, timeTaken }
 */
const addMoveToGame = async (gameId, moveData, expectedTurn = moveData.player) => {
  const nextTurn = expectedTurn === 'X' ? 'O' : 'X';

  return Game.findOneAndUpdate(
    {
      gameId,
      status: 'active',
      currentTurn: expectedTurn
    },
    {
      $push: { moves: moveData },
      $set: {
        lastMoveAt: new Date(),
        currentTurn: nextTurn,
        'result.totalMoves': moveData.moveNumber
      }
    },
    {
      new: true,
      runValidators: true
    }
  );
};

const skipTurn = async (gameId, expectedTurn, timeTaken = 0) => {
  const nextTurn = expectedTurn === 'X' ? 'O' : 'X';
  const safeTimeTaken = Math.max(0, Number(timeTaken) || 0);

  return Game.findOneAndUpdate(
    {
      gameId,
      status: 'active',
      currentTurn: expectedTurn
    },
    {
      $set: {
        lastMoveAt: new Date(),
        currentTurn: nextTurn
      },
      $inc: {
        [`players.${expectedTurn}.totalTimeUsed`]: safeTimeTaken
      }
    },
    {
      new: true,
      runValidators: true
    }
  );
};

/**
 * Complete a game
 * @param {string} gameId - Custom game identifier
 * @param {Object} resultData - Result data { winner, winReason, winningTiles }
 */
const completeGame = async (gameId, resultData) => {
  const game = await findByGameId(gameId);
  if (!game) {
    return null;
  }

  game.status = 'completed';
  game.result = {
    winner: resultData.winner,
    winReason: resultData.winReason,
    winningTiles: resultData.winningTiles || [],
    totalMoves: game.moves.length
  };
  game.completedAt = new Date();

  return game.save();
};

/**
 * Delete game by custom gameId
 * @param {string} gameId - Custom game identifier
 */
const deleteGameByGameId = (gameId) => Game.findOneAndDelete({ gameId });

/**
 * Get game statistics for a player
 * @param {string} userId - User ID
 */
const getPlayerGameStats = async (userId) => {
  const games = await Game.find({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId },
      { 'participants.playerId': userId }
    ],
    status: 'completed'
  });
  
  let wins = 0;
  let losses = 0;
  let draws = 0;
  
  games.forEach(game => {
    const isPlayerX = game.players.X.playerId.toString() === userId.toString();
    const winner = game.result.winner;
    
    if (winner === 'draw') {
      draws++;
    } else if ((isPlayerX && winner === 'X') || (!isPlayerX && winner === 'O')) {
      wins++;
    } else {
      losses++;
    }
  });
  
  return {
    total: games.length,
    wins,
    losses,
    draws,
    winRate: games.length > 0 ? ((wins / games.length) * 100).toFixed(2) : 0
  };
};

module.exports = {
  // CRUD
  findAllGames,
  findByMongoId,
  findByGameId,
  createGame,
  updateGameByGameId,
  deleteGameByGameId,

  // Player-specific queries
  findActiveGamesByPlayer,
  findHistoryByPlayer,
  countHistoryByPlayer,
  findWaitingGames,
  getPlayerGameStats,

  // Game operations
  addMoveToGame,
  skipTurn,
  completeGame,
};
