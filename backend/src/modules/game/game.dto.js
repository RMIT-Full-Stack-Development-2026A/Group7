// Request DTOs + small list/error/success DTOs for the game module.
// Heavier shapes live in game.responses.dto.js and game.history.dto.js.

const {
  GameResponseDTO,
  GameDetailResponseDTO,
  MoveResponseDTO,
} = require('./game.responses.dto');
const { GameHistoryListDTO } = require('./game.history.dto');

class CreateGameDTO {
  constructor(data) {
    this.gameMode = data.gameMode || 'singleplayer';
    this.boardSize = data.boardSize || 15;
    this.timeControl = data.timeControl || 60;
    this.opponentType = data.opponentType || 'ai';
    this.aiDifficulty = data.aiDifficulty || 'medium';
  }

  validate() {
    const validGameModes = ['singleplayer', 'multiplayer', 'local'];
    const validBoardSizes = [10, 15];
    const validOpponentTypes = ['ai', 'human'];
    const validAIDifficulties = ['easy', 'medium', 'hard'];

    if (!validGameModes.includes(this.gameMode)) {
      throw new Error(`Invalid gameMode. Must be one of: ${validGameModes.join(', ')}`);
    }
    if (!validBoardSizes.includes(this.boardSize)) {
      throw new Error('Invalid boardSize. Must be 10 or 15');
    }
    if (this.timeControl < 30 || this.timeControl > 720) {
      throw new Error('timeControl must be between 30 and 720 seconds');
    }
    if (this.gameMode === 'singleplayer') {
      if (!validOpponentTypes.includes(this.opponentType)) {
        throw new Error(`Invalid opponentType. Must be one of: ${validOpponentTypes.join(', ')}`);
      }
      if (this.opponentType === 'ai' && !validAIDifficulties.includes(this.aiDifficulty)) {
        throw new Error(`Invalid aiDifficulty. Must be one of: ${validAIDifficulties.join(', ')}`);
      }
    }
    return true;
  }

  toJSON() {
    return {
      gameMode: this.gameMode,
      boardSize: this.boardSize,
      timeControl: this.timeControl,
      opponentType: this.opponentType,
      aiDifficulty: this.aiDifficulty,
    };
  }
}

class MakeMoveDTO {
  constructor(data) {
    this.row = data.row;
    this.col = data.col;
    this.timeTaken = data.timeTaken || 0;
  }

  validate(boardSize) {
    if (this.row === undefined || this.col === undefined) {
      throw new Error('Row and column are required');
    }
    if (typeof this.row !== 'number' || typeof this.col !== 'number') {
      throw new Error('Row and column must be numbers');
    }
    if (this.row < 0 || this.row >= boardSize) {
      throw new Error(`Row must be between 0 and ${boardSize - 1}`);
    }
    if (this.col < 0 || this.col >= boardSize) {
      throw new Error(`Column must be between 0 and ${boardSize - 1}`);
    }
    if (this.timeTaken < 0 || this.timeTaken > 300) {
      throw new Error('timeTaken must be between 0 and 300 seconds');
    }
    return true;
  }

  toJSON() {
    return { row: this.row, col: this.col, timeTaken: this.timeTaken };
  }
}

class JoinGameDTO {
  constructor(data) {
    this.gameId = data.gameId;
  }

  validate() {
    if (!this.gameId) throw new Error('Game ID is required');
    if (typeof this.gameId !== 'string') throw new Error('Game ID must be a string');
    if (this.gameId.length < 10) throw new Error('Invalid game ID format');
    return true;
  }

  toJSON() {
    return { gameId: this.gameId };
  }
}

class GameStatsDTO {
  constructor(stats) {
    this.totalGames = stats.total;
    this.wins = stats.wins;
    this.losses = stats.losses;
    this.draws = stats.draws;
    this.winRate = stats.winRate;
  }

  toJSON() {
    return {
      totalGames: this.totalGames,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      winRate: this.winRate,
    };
  }
}

class WaitingGamesListDTO {
  constructor(games) {
    this.games = games.map((game) => ({
      gameId: game.gameId,
      boardSize: game.boardSize,
      host: {
        name: game.players.X.playerName,
        rank: game.players.X.playerRank,
      },
      createdAt: game.createdAt,
    }));
    this.count = games.length;
  }

  toJSON() {
    return { games: this.games, count: this.count };
  }
}

class ErrorResponseDTO {
  constructor(error, statusCode = 400) {
    this.success = false;
    this.error = error.message || error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: this.success,
      error: this.error,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}

class SuccessResponseDTO {
  constructor(data, message = null) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
      timestamp: this.timestamp,
    };
  }
}

module.exports = {
  CreateGameDTO,
  MakeMoveDTO,
  JoinGameDTO,
  GameResponseDTO,
  GameDetailResponseDTO,
  MoveResponseDTO,
  GameHistoryListDTO,
  GameStatsDTO,
  WaitingGamesListDTO,
  ErrorResponseDTO,
  SuccessResponseDTO,
};
