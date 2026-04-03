const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const GameSession = require('../models/GameSession');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  });

  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, username } = socket.user;
    console.log(`🔌 Socket connected: ${username} (${userId})`);

    // ── Join a room ─────────────────────────────────────────────────────────
    socket.on('join_room', async ({ roomId }) => {
      socket.join(roomId);
      const session = await GameSession.findOne({ roomId })
        .populate('player1', 'username avatar')
        .populate('player2', 'username avatar');
      if (!session) return socket.emit('error', { message: 'Room not found' });

      io.to(roomId).emit('room_state', serializeSession(session));

      // Notify player1 when player2 joins
      if (session.player2 && session.player2._id.toString() === userId) {
        socket.to(roomId).emit('player_joined', { userId, username });
      }
    });

    // ── Player 2 chooses mark → game starts ─────────────────────────────────
    socket.on('choose_mark', async ({ roomId, mark }) => {
      const session = await GameSession.findOne({ roomId, status: 'waiting' });
      if (!session) return socket.emit('error', { message: 'Room not available' });

      session.mark2 = mark;
      session.mark1 = mark === 'X' ? 'O' : 'X';
      session.status = 'active';
      await session.save();

      io.to(roomId).emit('game_started', {
        mark1: session.mark1,
        mark2: session.mark2,
        currentTurn: session.currentTurn,
      });
    });

    // ── Make a move ─────────────────────────────────────────────────────────
    socket.on('make_move', async ({ roomId, row, col }) => {
      const session = await GameSession.findOne({ roomId, status: 'active' });
      if (!session) return socket.emit('error', { message: 'Game not active' });
      if (session.currentTurn.toString() !== userId) return socket.emit('error', { message: 'Not your turn' });

      const idx = row * session.boardSize + col;
      if (session.board[idx] !== '') return socket.emit('error', { message: 'Cell already taken' });

      const mark = session.player1.toString() === userId ? session.mark1 : session.mark2;
      session.board[idx] = mark;
      session.moves.push({ player: userId, row, col, mark, timestamp: new Date() });

      const winLine = checkWin(session.board, session.boardSize, row, col, mark);
      if (winLine) {
        session.status = 'completed';
        session.winner = userId;
        session.endTime = new Date();
        await session.save();
        return io.to(roomId).emit('game_over', { winner: userId, winLine, board: session.board });
      }

      if (session.board.every((c) => c !== '')) {
        session.status = 'draw';
        session.endTime = new Date();
        await session.save();
        return io.to(roomId).emit('game_over', { winner: null, board: session.board });
      }

      // Switch turn
      session.currentTurn =
        session.currentTurn.toString() === session.player1.toString()
          ? session.player2
          : session.player1;
      await session.save();

      io.to(roomId).emit('move_made', {
        board: session.board,
        currentTurn: session.currentTurn,
        row, col, mark,
      });
    });

    // ── Chat ────────────────────────────────────────────────────────────────
    socket.on('chat_message', ({ roomId, message }) => {
      io.to(roomId).emit('chat_message', { userId, username, message, timestamp: new Date() });
    });

    socket.on('disconnect', () => console.log(`🔌 Disconnected: ${username}`));
  });

  return io;
}

function getIO() { return io; }

// Check for 5-in-a-row; returns array of winning cell indices or null
function checkWin(board, size, row, col, mark) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    const line = [row * size + col];
    for (const sign of [1, -1]) {
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i * sign;
        const c = col + dc * i * sign;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        if (board[r * size + c] !== mark) break;
        line.push(r * size + c);
      }
    }
    if (line.length >= 5) return line;
  }
  return null;
}

function serializeSession(s) {
  return {
    roomId: s.roomId,
    status: s.status,
    boardSize: s.boardSize,
    board: s.board,
    player1: s.player1,
    player2: s.player2,
    mark1: s.mark1,
    mark2: s.mark2,
    currentTurn: s.currentTurn,
    winner: s.winner,
  };
}

module.exports = { initSocket, getIO, checkWin };
