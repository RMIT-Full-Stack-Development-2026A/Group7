const { isAllowedOrigin } = require('../config/cors')

let ioInstance = null

const initGameroomSocketServer = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`Socket CORS blocked for origin: ${origin}`))
      },
      credentials: true,
    },
  });
  ioInstance = io;

  const gameNamespace = io.of('/gameroom');

  gameNamespace.on('connection', (socket) => {  
    console.log('User connected:', socket.id);

    socket.on('join-room', (data = {}) => {
      const { roomId, playerId, playerName } = data;
      if (!roomId) {
        return;
      }

      const roomKey = `room:${roomId}`;
      if (socket.data.currentGameroomRoomId === roomKey && socket.rooms.has(roomKey)) {
        return;
      }

      if (socket.data.currentGameroomRoomId && socket.data.currentGameroomRoomId !== roomKey) {
        socket.leave(socket.data.currentGameroomRoomId);
        socket.to(socket.data.currentGameroomRoomId).emit('player-left', {
          socketId: socket.id,
        });
      }

      socket.join(roomKey);
      socket.data.currentGameroomRoomId = roomKey;

      console.log(`Player ${playerName} joined room ${roomId}`);
      gameNamespace.to(roomKey).emit('player-joined', {
        playerId,
        playerName,
        socketId: socket.id,
      });
    });

    socket.on('configure-ai', (data) => {
      const { roomId, slotId, difficulty } = data;
      gameNamespace.to(`room:${roomId}`).emit('ai-configured', {
        slotId,
        difficulty,
      });
    });

    socket.on('update-settings', (data) => {
      const { roomId, settings } = data;
      gameNamespace.to(`room:${roomId}`).emit('settings-updated', settings);
    });

    socket.on('start-match', (data) => {
      const { roomId, payload } = data;
      gameNamespace.to(`room:${roomId}`).emit('game-started', {
        startTime: new Date(),
        payload,
      });
    });

    socket.on('game-move', (data) => {
      const { roomId, row, col, player } = data;
      socket.to(`room:${roomId}`).emit('game-move-applied', {
        row,
        col,
        player,
      });
    });

    socket.on('game-action', (data) => {
      const { roomId, action, payload } = data;
      gameNamespace.to(`room:${roomId}`).emit('game-action', {
        action,
        payload,
        playerId: socket.id,
      });
    });

    socket.on('leave-room', (data = {}) => {
      const { roomId } = data;
      if (!roomId) {
        return;
      }

      const roomKey = `room:${roomId}`;
      if (!socket.rooms.has(roomKey)) {
        return;
      }

      socket.leave(roomKey);
      if (socket.data.currentGameroomRoomId === roomKey) {
        socket.data.currentGameroomRoomId = null;
      }

      gameNamespace.to(roomKey).emit('player-left', {
        socketId: socket.id,
      });
      console.log(`Player left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => ioInstance

const emitGameroomEvent = (roomId, eventName, payload) => {
  if (!ioInstance || !roomId) {
    return
  }

  ioInstance.of('/gameroom').to(`room:${roomId}`).emit(eventName, payload)
}

module.exports = {
  initGameroomSocketServer,
  getIO,
  emitGameroomEvent,
};
