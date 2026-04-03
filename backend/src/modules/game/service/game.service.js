const { v4: uuidv4 } = require('uuid');
const GameSession = require('../../../models/GameSession');
const { getIO } = require('../../../config/socket');

// 5-in-a-row win check
function checkWin(board, size, row, col, mark) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    const line = [row * size + col];
    for (const sign of [1, -1]) {
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i * sign, c = col + dc * i * sign;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        if (board[r * size + c] !== mark) break;
        line.push(r * size + c);
      }
    }
    if (line.length >= 5) return line;
  }
  return null;
}

async function createGame(userId, { gameType, player2Name, boardSize = 10 }) {
  const size = [10, 15].includes(boardSize) ? boardSize : 10;
  const board = Array(size * size).fill('');

  const session = await GameSession.create({
    roomId:      uuidv4(),
    gameType:    gameType || 'local',
    boardSize:   size,
    board,
    player1:     userId,
    player2Name: player2Name || null,
    mark1:       'X',
    mark2:       'O',
    currentTurn: userId,
    // localTurn tracks whose turn it is for local games: 'player1' | 'player2'
    localTurn:   'player1',
    status:      gameType === 'online' ? 'waiting' : 'active',
  });

  return session;
}

async function listWaitingRooms() {
  return GameSession.find({ gameType: 'online', status: 'waiting' })
    .populate('player1', 'username avatar')
    .select('roomId player1 status startTime boardSize')
    .sort({ startTime: -1 })
    .lean();
}

async function getRoom(roomId) {
  const session = await GameSession.findOne({ roomId })
    .populate('player1', 'username avatar')
    .populate('player2', 'username avatar')
    .populate('winner',  'username');
  if (!session) { const e = new Error('Room not found'); e.status = 404; throw e; }
  return session;
}

async function joinRoom(roomId, userId) {
  const session = await GameSession.findOne({ roomId, status: 'waiting' });
  if (!session) { const e = new Error('Room not available'); e.status = 404; throw e; }
  if (session.player1.toString() === userId)
    { const e = new Error('Cannot join your own room'); e.status = 400; throw e; }
  if (session.player2) { const e = new Error('Room is full'); e.status = 409; throw e; }

  session.player2 = userId;
  await session.save();
  return session;
}

async function abortGame(roomId, userId, isAdmin = false) {
  const session = await GameSession.findOne({ roomId });
  if (!session) { const e = new Error('Room not found'); e.status = 404; throw e; }

  if (!isAdmin) {
    const isParticipant =
      session.player1.toString() === userId ||
      (session.player2 && session.player2.toString() === userId);
    if (!isParticipant) { const e = new Error('Not a participant'); e.status = 403; throw e; }
  }

  if (!['waiting', 'active'].includes(session.status))
    { const e = new Error('Game is not active'); e.status = 400; throw e; }

  session.status  = 'aborted';
  session.endTime = new Date();
  await session.save();

  const io = getIO();
  if (io) io.to(roomId).emit('game_aborted', { roomId, by: isAdmin ? 'admin' : userId });

  return { message: 'Game aborted', roomId };
}

async function makeLocalMove(roomId, userId, { row, col }) {
  const session = await GameSession.findOne({ roomId, status: 'active', gameType: 'local' });
  if (!session) { const e = new Error('Game not found or not active'); e.status = 404; throw e; }

  // Local pass-and-play: localTurn determines which mark to place.
  // No per-player restriction — both players share the same screen and JWT.
  const currentIsP1 = (session.localTurn || 'player1') === 'player1';

  const idx = row * session.boardSize + col;
  if (session.board[idx] !== '') { const e = new Error('Cell already taken'); e.status = 400; throw e; }

  const mark = currentIsP1 ? session.mark1 : session.mark2;
  session.board[idx] = mark;
  session.moves.push({ player: userId, row, col, mark, timestamp: new Date() });

  const winLine = checkWin(session.board, session.boardSize, row, col, mark);
  if (winLine) {
    session.status  = 'completed';
    session.winner  = userId;
    session.endTime = new Date();
    await session.save();
    return { board: session.board, status: 'completed', winner: userId, winnerName: currentIsP1 ? 'player1' : 'player2', winLine };
  }

  if (session.board.every((c) => c !== '')) {
    session.status  = 'draw';
    session.endTime = new Date();
    await session.save();
    return { board: session.board, status: 'draw', winner: null };
  }

  // Switch turn
  session.localTurn = currentIsP1 ? 'player2' : 'player1';
  await session.save();

  return { board: session.board, status: 'active', localTurn: session.localTurn };
}

async function getReplay(roomId) {
  const session = await GameSession.findOne({ roomId })
    .populate('player1', 'username')
    .populate('player2', 'username')
    .select('roomId boardSize board moves status winner player1 player2 startTime endTime');
  if (!session) { const e = new Error('Room not found'); e.status = 404; throw e; }
  return session;
}

module.exports = { createGame, listWaitingRooms, getRoom, joinRoom, abortGame, makeLocalMove, getReplay, checkWin };