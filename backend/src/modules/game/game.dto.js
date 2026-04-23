// game.dto.js

/**
 * DTO for creating a new game
 */
class CreateGameDTO {
  constructor(data) {
    this.gameMode = data.gameMode || 'singleplayer';
    this.boardSize = data.boardSize || 15;
    this.timeControl = data.timeControl || 60;
    this.opponentType = data.opponentType || 'ai';
    this.aiDifficulty = data.aiDifficulty || 'medium';
  }

  validate() {
     console.log('🔍 Validating gameMode:', this.gameMode);
    const validGameModes = ['singleplayer', 'multiplayer', 'local'];
    const validBoardSizes = [10, 15];
    const validOpponentTypes = ['ai', 'human'];
    const validAIDifficulties = ['easy', 'medium', 'hard'];

    if (!validGameModes.includes(this.gameMode)) {
      console.log('❌ Invalid gameMode:', this.gameMode, 'Valid modes:', validGameModes);
      throw new Error(`Invalid gameMode. Must be one of: ${validGameModes.join(', ')}`);
    }

    if (!validBoardSizes.includes(this.boardSize)) {
      throw new Error(`Invalid boardSize. Must be 10 or 15`);
    }

    if (this.timeControl < 30 || this.timeControl > 300) {
      throw new Error('timeControl must be between 30 and 300 seconds');
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
      aiDifficulty: this.aiDifficulty
    };
  }
}

/**
 * DTO for making a move
 */
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
    return {
      row: this.row,
      col: this.col,
      timeTaken: this.timeTaken
    };
  }
}

/**
 * DTO for joining a game
 */
class JoinGameDTO {
  constructor(data) {
    this.gameId = data.gameId;
  }

  validate() {
    if (!this.gameId) {
      throw new Error('Game ID is required');
    }

    if (typeof this.gameId !== 'string') {
      throw new Error('Game ID must be a string');
    }

    if (this.gameId.length < 10) {
      throw new Error('Invalid game ID format');
    }

    return true;
  }

  toJSON() {
    return {
      gameId: this.gameId
    };
  }
}

/**
 * DTO for game response (sent to client)
 */
class GameResponseDTO {
  constructor(game, currentUserId = null) {
    this.gameId = game.gameId;
    this.boardSize = game.boardSize;
    this.gameMode = game.gameMode;
    this.status = game.status;
    this.currentTurn = game.currentTurn;
    this.timeControl = game.timeControl;
    
    // Players info
    this.players = {
      X: {
        id: game.players.X.playerId,
        name: game.players.X.playerName,
        avatar: game.players.X.avatar || '',
        rank: game.players.X.playerRank,
        isAI: game.players.X.isAI,
        totalTimeUsed: game.players.X.totalTimeUsed
      },
      O: {
        id: game.players.O.playerId,
        name: game.players.O.playerName,
        avatar: game.players.O.avatar || '',
        rank: game.players.O.playerRank,
        isAI: game.players.O.isAI,
        totalTimeUsed: game.players.O.totalTimeUsed
      }
    };

    // Determine current player info
    if (currentUserId) {
      const isPlayerX = game.players.X.playerId === currentUserId;
      const isPlayerO = game.players.O.playerId === currentUserId;
      
      this.isCurrentPlayer = (game.status === 'active' && 
        ((game.currentTurn === 'X' && isPlayerX) || 
         (game.currentTurn === 'O' && isPlayerO)));
      
      this.playerSymbol = isPlayerX ? 'X' : (isPlayerO ? 'O' : null);
    }

    // Result if game is completed
    if (game.status === 'completed' && game.result) {
      this.result = {
        winner: game.result.winner,
        winReason: game.result.winReason,
        totalMoves: game.result.totalMoves
      };
    }

    // Timestamps
    this.startedAt = game.startedAt;
    this.lastMoveAt = game.lastMoveAt;
    this.completedAt = game.completedAt;
  }

  toJSON() {
    return {
      gameId: this.gameId,
      boardSize: this.boardSize,
      gameMode: this.gameMode,
      status: this.status,
      currentTurn: this.currentTurn,
      timeControl: this.timeControl,
      players: this.players,
      isCurrentPlayer: this.isCurrentPlayer,
      playerSymbol: this.playerSymbol,
      result: this.result,
      startedAt: this.startedAt,
      lastMoveAt: this.lastMoveAt,
      completedAt: this.completedAt
    };
  }
}

/**
 * DTO for detailed game state (includes board and moves)
 */
class GameDetailResponseDTO extends GameResponseDTO {
  constructor(game, currentUserId = null) {
    super(game, currentUserId);
    
    // Board state reconstructed from moves
    this.board = this.reconstructBoard(game);
    this.moves = game.moves;
    this.moveCount = game.moves.length;
  }

  reconstructBoard(game) {
    const board = Array(game.boardSize).fill().map(() => Array(game.boardSize).fill(null));
    
    for (const move of game.moves) {
      board[move.row][move.col] = move.player;
    }
    
    return board;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      board: this.board,
      moves: this.moves,
      moveCount: this.moveCount
    };
  }
}

/**
 * DTO for move response
 */
class MoveResponseDTO {
  constructor(move, game) {
    this.moveNumber = move.moveNumber;
    this.player = move.player;
    this.row = move.row;
    this.col = move.col;
    this.timeTaken = move.timeTaken;
    this.timestamp = move.timestamp;
    
    this.isWin = game.result && game.result.winner === move.player;
    this.isDraw = game.result && game.result.winner === 'draw';
    this.gameStatus = game.status;
    this.currentTurn = game.currentTurn;
    
    if (this.isWin && game.result.winningTiles) {
      this.winningTiles = game.result.winningTiles;
    }
  }

  toJSON() {
    return {
      moveNumber: this.moveNumber,
      player: this.player,
      row: this.row,
      col: this.col,
      timeTaken: this.timeTaken,
      timestamp: this.timestamp,
      isWin: this.isWin,
      isDraw: this.isDraw,
      gameStatus: this.gameStatus,
      currentTurn: this.currentTurn,
      winningTiles: this.winningTiles
    };
  }
}

/**
 * DTO for game history list
 */
class GameHistoryListDTO {
  constructor(games, currentUserId, pagination) {
    this.games = games.map(game => {
      const isPlayerX = String(game.players.X.playerId) === String(currentUserId)
      const isPlayerO = String(game.players.O.playerId) === String(currentUserId)
      const participants = Array.isArray(game.participants) && game.participants.length > 0
        ? game.participants
        : [
            {
              playerId: game.players.X.playerId,
              playerName: game.players.X.playerName,
              avatar: game.players.X.avatar || '',
              playerSymbol: 'X',
              marker: 'X',
              order: 1,
              isAI: game.players.X.isAI,
              aiDifficulty: game.players.X.aiDifficulty,
            },
            {
              playerId: game.players.O.playerId,
              playerName: game.players.O.playerName,
              avatar: game.players.O.avatar || '',
              playerSymbol: 'O',
              marker: 'O',
              order: 2,
              isAI: game.players.O.isAI,
              aiDifficulty: game.players.O.aiDifficulty,
            },
          ]
      const currentParticipant = participants.find((participant) => String(participant.playerId) === String(currentUserId))
      const currentParticipantSymbol = currentParticipant?.playerSymbol || currentParticipant?.marker
      const isKnownPlayer = isPlayerX || isPlayerO || Boolean(currentParticipant)
      const player = isPlayerX ? game.players.X : game.players.O
      const opponent = isPlayerX ? game.players.O : game.players.X
      const winner = game.result?.winner
      const resultLabel = winner === 'draw'
        ? 'Draw'
        : !isKnownPlayer
          ? 'Unknown'
          : ((isPlayerX && winner === 'X') || (isPlayerO && winner === 'O') || (currentParticipantSymbol && winner === currentParticipantSymbol) ? 'Victory' : 'Defeat')

      return {
        gameId: game.gameId,
        boardSize: game.boardSize,
        result: game.result,
        resultLabel,
        player: {
          id: player.playerId,
          name: player.playerName,
          avatar: player.avatar || '',
          symbol: isPlayerX ? 'X' : 'O',
          isAI: player.isAI,
        },
        opponent: {
          id: opponent.playerId,
          name: opponent.playerName,
          avatar: opponent.avatar || '',
          symbol: isPlayerX ? 'O' : 'X',
          isAI: opponent.isAI,
        },
        participants: participants
          .slice()
          .sort((first, second) => (first.order || 0) - (second.order || 0))
          .map((participant, index) => ({
            id: participant.playerId,
            userId: participant.playerId,
            name: participant.playerName,
            avatar: participant.avatar || '',
            symbol: participant.playerSymbol || participant.marker || `P${index + 1}`,
            marker: participant.marker || participant.playerSymbol || `P${index + 1}`,
            order: participant.order || index + 1,
            isAI: participant.isAI,
            aiDifficulty: participant.aiDifficulty || null,
            isCurrentUser: String(participant.playerId) === String(currentUserId),
          })),
        startedAt: game.startedAt,
        completedAt: game.completedAt,
        totalMoves: game.result?.totalMoves ?? game.moves.length,
        duration: game.duration
      }
    });
    
    this.pagination = pagination;
  }

  toJSON() {
    return {
      games: this.games,
      pagination: this.pagination
    };
  }
}

/**
 * DTO for game replay (watch past games)
 */
class GameReplayDTO {
  constructor(game, movesWithBoardStates) {
    this.gameId = game.gameId;
    this.boardSize = game.boardSize;
    this.gameMode = game.gameMode;
    
    this.players = {
      X: {
        name: game.players.X.playerName,
        rank: game.players.X.playerRank,
        isAI: game.players.X.isAI
      },
      O: {
        name: game.players.O.playerName,
        rank: game.players.O.playerRank,
        isAI: game.players.O.isAI
      }
    };
    
    this.result = {
      winner: game.result.winner,
      winReason: game.result.winReason,
      totalMoves: game.result.totalMoves
    };
    
    this.moves = movesWithBoardStates;
    this.startedAt = game.startedAt;
    this.completedAt = game.completedAt;
    this.duration = game.duration;
  }

  toJSON() {
    return {
      gameId: this.gameId,
      boardSize: this.boardSize,
      gameMode: this.gameMode,
      players: this.players,
      result: this.result,
      moves: this.moves,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      duration: this.duration
    };
  }
}

/**
 * DTO for game statistics
 */
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
      winRate: this.winRate
    };
  }
}

/**
 * DTO for waiting games list (matchmaking)
 */
class WaitingGamesListDTO {
  constructor(games) {
    this.games = games.map(game => ({
      gameId: game.gameId,
      boardSize: game.boardSize,
      host: {
        name: game.players.X.playerName,
        rank: game.players.X.playerRank
      },
      createdAt: game.createdAt
    }));
    this.count = games.length;
  }

  toJSON() {
    return {
      games: this.games,
      count: this.count
    };
  }
}

/**
 * DTO for error response
 */
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
      timestamp: this.timestamp
    };
  }
}

/**
 * DTO for success response
 */
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
      timestamp: this.timestamp
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
  GameReplayDTO,
  GameStatsDTO,
  WaitingGamesListDTO,
  ErrorResponseDTO,
  SuccessResponseDTO
};
