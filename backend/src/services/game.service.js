const Game = require('../models/GameSession');
let ioInstance = null;

function initSocket(io) {
  ioInstance = io;
}

async function abortRoom(roomId, adminUser) {
  const game = await Game.findOne({ roomNumber: roomId });
  if (!game) return { ok: false, error: 'Room not found' };
  if (game.status === 'FINISHED') return { ok: false, error: 'Room already finished' };

  game.status = 'ABORTED';
  game.endTime = new Date();
  game.endedBy = adminUser.sub || adminUser.id;
  await game.save();

  // Emit to room participants and admin channel
  if (ioInstance) {
    // notify players in the room
    ioInstance.to(`room:${roomId}`).emit('game:aborted', { roomId, reason: 'aborted_by_admin', by: adminUser.sub });
    // notify admin dashboard listeners
    ioInstance.to('admins').emit('admin:roomAborted', { roomId, game });
  }

  return { ok: true, game };
}

module.exports = { initSocket, abortRoom };