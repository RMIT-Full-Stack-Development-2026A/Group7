// game.history.js
const gameRepository = require('./game.repository');

/**
 * Game History Service
 * Handles storage, retrieval, and replay of completed games
 */

/**
 * Save completed game to history
 * @param {string} gameId - Custom game identifier
 * @returns {Promise<Object>} - Saved game data
 */
const saveToHistory = async (gameId) => {
  const game = await gameRepository.findByGameId(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (game.status !== 'completed') {
    throw new Error('Cannot save incomplete game to history');
  }
  
  // Game is already saved in the database
  // This function is mainly for additional processing if needed
  // e.g., updating user statistics, sending notifications, etc.
  
  return {
    gameId: game.gameId,
    savedAt: new Date(),
    status: 'archived'
  };
};

/**
 * Get game history for a player with filtering options
 * @param {string} userId - User ID
 * @param {Object} options - Filter options
 * @param {number} options.limit - Number of games to return
 * @param {number} options.skip - Number of games to skip
 * @param {string} options.result - Filter by result ('win', 'loss', 'draw')
 * @param {string} options.dateFrom - Start date filter
 * @param {string} options.dateTo - End date filter
 * @returns {Promise<Object>} - History games with metadata
 */
const getPlayerHistory = async (userId, options = {}) => {
  const {
    limit = 50,
    skip = 0,
    result = null,
    dateFrom = null,
    dateTo = null
  } = options;

  let query = {
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId }
    ],
    status: 'completed'
  };

  // Filter by result
  if (result) {
    if (result === 'win') {
      query['result.winner'] = { $ne: 'draw' };
      query.$or = [
        { 'players.X.playerId': userId, 'result.winner': 'X' },
        { 'players.O.playerId': userId, 'result.winner': 'O' }
      ];
    } else if (result === 'loss') {
      query['result.winner'] = { $ne: 'draw' };
      query.$or = [
        { 'players.X.playerId': userId, 'result.winner': 'O' },
        { 'players.O.playerId': userId, 'result.winner': 'X' }
      ];
    } else if (result === 'draw') {
      query['result.winner'] = 'draw';
    }
  }

  // Filter by date range
  if (dateFrom) {
    query.completedAt = { $gte: new Date(dateFrom) };
  }
  if (dateTo) {
    query.completedAt = { ...query.completedAt, $lte: new Date(dateTo) };
  }

  const games = await gameRepository.findAllGames(query, {
    sort: { completedAt: -1 },
    limit,
    skip
  });

  const total = await gameRepository.countGamesByPlayer(userId, 'completed');

  // Enrich games with player-specific metadata
  const enrichedGames = games.map(game => enrichGameHistory(game, userId));

  return {
    games: enrichedGames,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Enrich game history with player-specific metadata
 * @param {Object} game - Game document
 * @param {string} userId - User ID
 * @returns {Object} - Enriched game data
 */
const enrichGameHistory = (game, userId) => {
  const isPlayerX = game.players.X.playerId === userId;
  const isPlayerO = game.players.O.playerId === userId;
  
  let result = 'draw';
  let rankChange = 0;
  
  if (game.result.winner !== 'draw') {
    const playerWon = (isPlayerX && game.result.winner === 'X') || 
                      (isPlayerO && game.result.winner === 'O');
    result = playerWon ? 'win' : 'loss';
    
    // Calculate rank change (simplified ELO calculation)
    const expectedScore = 0.5;
    const actualScore = playerWon ? 1 : 0;
    const kFactor = 32;
    rankChange = Math.round(kFactor * (actualScore - expectedScore));
  }
  
  return {
    gameId: game.gameId,
    boardSize: game.boardSize,
    gameMode: game.gameMode,
    result,
    rankChange,
    opponent: {
      id: isPlayerX ? game.players.O.playerId : game.players.X.playerId,
      name: isPlayerX ? game.players.O.playerName : game.players.X.playerName,
      rank: isPlayerX ? game.players.O.playerRank : game.players.X.playerRank,
      isAI: isPlayerX ? game.players.O.isAI : game.players.X.isAI
    },
    mySymbol: isPlayerX ? 'X' : 'O',
    totalMoves: game.moves.length,
    duration: game.duration,
    startedAt: game.startedAt,
    completedAt: game.completedAt,
    winReason: game.result.winReason
  };
};

/**
 * Get detailed game replay data
 * @param {string} gameId - Game identifier
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Full replay data with move-by-move board states
 */
const getGameReplay = async (gameId, userId) => {
  const game = await gameRepository.findByGameId(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (game.status !== 'completed') {
    throw new Error('Replay only available for completed games');
  }
  
  // Check authorization
  const isPlayerX = game.players.X.playerId === userId;
  const isPlayerO = game.players.O.playerId === userId;
  
  if (!isPlayerX && !isPlayerO && game.gameMode !== 'local') {
    throw new Error('Not authorized to view this replay');
  }
  
  // Reconstruct board state at each move
  const replayData = [];
  const board = Array(game.boardSize).fill().map(() => Array(game.boardSize).fill(null));
  
  for (let i = 0; i < game.moves.length; i++) {
    const move = game.moves[i];
    board[move.row][move.col] = move.player;
    
    replayData.push({
      moveNumber: move.moveNumber,
      player: move.player,
      row: move.row,
      col: move.col,
      timeTaken: move.timeTaken,
      timestamp: move.timestamp,
      boardState: JSON.parse(JSON.stringify(board)) // Deep copy
    });
  }
  
  // Get winning tiles if available
  let winningTiles = [];
  if (game.result.winningTiles && game.result.winningTiles.length > 0) {
    winningTiles = game.result.winningTiles;
  }
  
  return {
    gameInfo: {
      gameId: game.gameId,
      boardSize: game.boardSize,
      gameMode: game.gameMode,
      timeControl: game.timeControl,
      startedAt: game.startedAt,
      completedAt: game.completedAt,
      duration: game.duration
    },
    players: {
      X: {
        id: game.players.X.playerId,
        name: game.players.X.playerName,
        rank: game.players.X.playerRank,
        isAI: game.players.X.isAI,
        totalTimeUsed: game.players.X.totalTimeUsed
      },
      O: {
        id: game.players.O.playerId,
        name: game.players.O.playerName,
        rank: game.players.O.playerRank,
        isAI: game.players.O.isAI,
        totalTimeUsed: game.players.O.totalTimeUsed
      }
    },
    result: {
      winner: game.result.winner,
      winReason: game.result.winReason,
      totalMoves: game.result.totalMoves,
      winningTiles
    },
    moves: replayData,
    totalMoves: game.moves.length
  };
};

/**
 * Get game statistics for a player
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Player statistics
 */
const getPlayerStatistics = async (userId) => {
  const games = await gameRepository.findAllGames({
    $or: [
      { 'players.X.playerId': userId },
      { 'players.O.playerId': userId }
    ],
    status: 'completed'
  });
  
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalMoves = 0;
  let totalTime = 0;
  let rankHistory = [];
  
  // Track win/loss streaks
  let currentStreak = 0;
  let maxStreak = 0;
  let lastResult = null;
  
  // Sort by completed date for streak calculation
  const sortedGames = [...games].sort((a, b) => a.completedAt - b.completedAt);
  
  for (const game of sortedGames) {
    const isPlayerX = game.players.X.playerId === userId;
    const isPlayerO = game.players.O.playerId === userId;
    
    totalMoves += game.moves.length;
    totalTime += (isPlayerX ? game.players.X.totalTimeUsed : game.players.O.totalTimeUsed);
    
    let gameResult = 'draw';
    
    if (game.result.winner !== 'draw') {
      const playerWon = (isPlayerX && game.result.winner === 'X') || 
                        (isPlayerO && game.result.winner === 'O');
      gameResult = playerWon ? 'win' : 'loss';
      
      if (playerWon) {
        wins++;
        if (lastResult === 'win') {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        lastResult = 'win';
      } else {
        losses++;
        if (lastResult === 'loss') {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        lastResult = 'loss';
      }
    } else {
      draws++;
      currentStreak = 0;
      lastResult = null;
    }
    
    maxStreak = Math.max(maxStreak, currentStreak);
    
    // Track rank history (simplified)
    const playerRank = isPlayerX ? game.players.X.playerRank : game.players.O.playerRank;
    rankHistory.push({
      date: game.completedAt,
      rank: playerRank,
      result: gameResult
    });
  }
  
  // Calculate win rate
  const totalGames = wins + losses + draws;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
  
  // Calculate average game duration
  const avgDuration = totalGames > 0 ? 
    Math.round(games.reduce((sum, g) => sum + (g.duration || 0), 0) / totalGames) : 0;
  
  // Calculate average moves per game
  const avgMovesPerGame = totalGames > 0 ? Math.round(totalMoves / totalGames) : 0;
  
  // Get performance against AI vs Humans
  let vsAI = { wins: 0, losses: 0, draws: 0 };
  let vsHuman = { wins: 0, losses: 0, draws: 0 };
  
  for (const game of games) {
    const isPlayerX = game.players.X.playerId === userId;
    const opponent = isPlayerX ? game.players.O : game.players.X;
    const isAgainstAI = opponent.isAI;
    
    let gameResult = 'draw';
    if (game.result.winner !== 'draw') {
      const playerWon = (isPlayerX && game.result.winner === 'X') || 
                        (isPlayerO && game.result.winner === 'O');
      gameResult = playerWon ? 'win' : 'loss';
    }
    
    if (isAgainstAI) {
      if (gameResult === 'win') vsAI.wins++;
      else if (gameResult === 'loss') vsAI.losses++;
      else vsAI.draws++;
    } else {
      if (gameResult === 'win') vsHuman.wins++;
      else if (gameResult === 'loss') vsHuman.losses++;
      else vsHuman.draws++;
    }
  }
  
  return {
    totalGames,
    wins,
    losses,
    draws,
    winRate,
    currentStreak,
    maxStreak,
    totalMoves,
    totalTime,
    avgTimePerMove: totalMoves > 0 ? Math.round(totalTime / totalMoves) : 0,
    avgDuration,
    avgMovesPerGame,
    performance: {
      vsAI,
      vsHuman
    },
    rankHistory: rankHistory.slice(-10) // Last 10 rank changes
  };
};

/**
 * Get leaderboard data
 * @param {string} timeRange - 'all', 'month', 'week'
 * @param {number} limit - Number of players to return
 * @returns {Promise<Array>} - Leaderboard entries
 */
const getLeaderboard = async (timeRange = 'all', limit = 50) => {
  // Calculate date filter based on timeRange
  let dateFilter = {};
  const now = new Date();
  
  if (timeRange === 'week') {
    dateFilter = { completedAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
  } else if (timeRange === 'month') {
    dateFilter = { completedAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
  }
  
  // Get all completed games
  const games = await gameRepository.findAllGames({
    status: 'completed',
    ...dateFilter
  });
  
  // Aggregate player statistics
  const playerStats = new Map();
  
  for (const game of games) {
    // Process both players
    const players = [game.players.X, game.players.O];
    
    for (const player of players) {
      if (!player.playerId || player.isAI) continue; // Skip AI players
      
      if (!playerStats.has(player.playerId)) {
        playerStats.set(player.playerId, {
          playerId: player.playerId,
          name: player.playerName,
          rank: player.playerRank || 1200,
          wins: 0,
          losses: 0,
          draws: 0,
          totalGames: 0
        });
      }
      
      const stats = playerStats.get(player.playerId);
      stats.totalGames++;
      
      // Determine result for this player
      if (game.result.winner === 'draw') {
        stats.draws++;
      } else if (game.result.winner === player.playerSymbol) {
        stats.wins++;
      } else {
        stats.losses++;
      }
    }
  }
  
  // Calculate win rates and convert to array
  const leaderboard = Array.from(playerStats.values()).map(stats => ({
    ...stats,
    winRate: stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0
  }));
  
  // Sort by rank (higher is better) then by win rate
  leaderboard.sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    return b.winRate - a.winRate;
  });
  
  return leaderboard.slice(0, limit);
};

/**
 * Delete old game history (cleanup)
 * @param {number} daysOld - Delete games older than this many days
 * @returns {Promise<Object>} - Deletion result
 */
const cleanupOldHistory = async (daysOld = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const oldGames = await gameRepository.findAllGames({
    status: 'completed',
    completedAt: { $lt: cutoffDate }
  });
  
  let deletedCount = 0;
  
  for (const game of oldGames) {
    // Optionally archive before deleting
    await gameRepository.deleteGameByGameId(game.gameId);
    deletedCount++;
  }
  
  return {
    deletedCount,
    cutoffDate,
    message: `Deleted ${deletedCount} games older than ${daysOld} days`
  };
};

/**
 * Export game history to JSON
 * @param {string} userId - User ID
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export data
 */
const exportGameHistory = async (userId, options = {}) => {
  const { dateFrom = null, dateTo = null, format = 'json' } = options;
  
  const history = await getPlayerHistory(userId, {
    limit: 1000, // Large limit for export
    skip: 0,
    dateFrom,
    dateTo
  });
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    userId,
    totalGames: history.games.length,
    games: history.games
  };
  
  if (format === 'json') {
    return exportData;
  }
  
  // Could add CSV conversion here if needed
  return exportData;
};

module.exports = {
  saveToHistory,
  getPlayerHistory,
  getGameReplay,
  getPlayerStatistics,
  getLeaderboard,
  cleanupOldHistory,
  exportGameHistory
};