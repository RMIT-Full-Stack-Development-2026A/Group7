// Response DTOs for the game module: shape of /games/* read responses.

class GameResponseDTO {
  constructor(game, currentUserId = null) {
    this.gameId = game.gameId;
    this.boardSize = game.boardSize;
    this.gameMode = game.gameMode;
    this.status = game.status;
    this.currentTurn = game.currentTurn;
    this.timeControl = game.timeControl;

    this.players = {
      X: {
        id: game.players.X.playerId,
        name: game.players.X.playerName,
        avatar: game.players.X.avatar || '',
        rank: game.players.X.playerRank,
        isAI: game.players.X.isAI,
        totalTimeUsed: game.players.X.totalTimeUsed,
      },
      O: {
        id: game.players.O.playerId,
        name: game.players.O.playerName,
        avatar: game.players.O.avatar || '',
        rank: game.players.O.playerRank,
        isAI: game.players.O.isAI,
        totalTimeUsed: game.players.O.totalTimeUsed,
      },
    };

    if (currentUserId) {
      const isPlayerX = game.players.X.playerId === currentUserId;
      const isPlayerO = game.players.O.playerId === currentUserId;
      this.isCurrentPlayer = game.status === 'active'
        && ((game.currentTurn === 'X' && isPlayerX) || (game.currentTurn === 'O' && isPlayerO));
      this.playerSymbol = isPlayerX ? 'X' : (isPlayerO ? 'O' : null);
    }

    if (game.status === 'completed' && game.result) {
      this.result = {
        winner: game.result.winner,
        winReason: game.result.winReason,
        totalMoves: game.result.totalMoves,
      };
    }

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
      completedAt: this.completedAt,
    };
  }
}

// Detailed game state — includes the reconstructed board + every move.
class GameDetailResponseDTO extends GameResponseDTO {
  constructor(game, currentUserId = null) {
    super(game, currentUserId);
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
      moveCount: this.moveCount,
    };
  }
}

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
      winningTiles: this.winningTiles,
    };
  }
}

module.exports = {
  GameResponseDTO,
  GameDetailResponseDTO,
  MoveResponseDTO,
};
