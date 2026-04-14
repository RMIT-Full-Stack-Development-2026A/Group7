const initSocketServer = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  const gameNamespace = io.of('/gameroom');

  gameNamespace.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', (data) => {
      const { roomId, playerId, playerName } = data;
      socket.join(`room:${roomId}`);
      
      console.log(`Player ${playerName} joined room ${roomId}`);
      gameNamespace.to(`room:${roomId}`).emit('player-joined', {
        playerId,
        playerName,
        socketId: socket.id,
      });
    });

    // Configure AI
    socket.on('configure-ai', (data) => {
      const { roomId, slotId, difficulty } = data;
      gameNamespace.to(`room:${roomId}`).emit('ai-configured', {
        slotId,
        difficulty,
      });
    });

    // Update settings
    socket.on('update-settings', (data) => {
      const { roomId, settings } = data;
      gameNamespace.to(`room:${roomId}`).emit('settings-updated', settings);
    });

    // Start match
    socket.on('start-match', (data) => {
      const { roomId } = data;
      gameNamespace.to(`room:${roomId}`).emit('game-started', {
        startTime: new Date(),
      });
    });

    // Send game action
    socket.on('game-action', (data) => {
      const { roomId, action, payload } = data;
      gameNamespace.to(`room:${roomId}`).emit('game-action', {
        action,
        payload,
        playerId: socket.id,
      });
    });

    // Leave room
    socket.on('leave-room', (data) => {
      const { roomId } = data;
      socket.leave(`room:${roomId}`);
      gameNamespace.to(`room:${roomId}`).emit('player-left', {
        socketId: socket.id,
      });
      console.log(`Player left room ${roomId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = {
  initSocketServer,
};
