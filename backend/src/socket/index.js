const { Server } = require('socket.io');
const gameService = require('../services/game.service');

function initSocketServer(httpServer, options = {}) {
  const io = new Server(httpServer, { cors: { origin: '*' }, ...options });

  // attach to service
  gameService.initSocket(io);

  io.on('connection', (socket) => {
    // join admin channel if client authenticates as admin
    socket.on('auth', (payload) => {
      // payload should contain token or role info; validate on server in production
      if (payload && payload.role === 'admin') {
        socket.join('admins');
      }
      if (payload && payload.roomId) {
        socket.join(`room:${payload.roomId}`);
      }
    });

    // admin abort via socket (optional)
    socket.on('admin:abortRoom', async ({ roomId, token }) => {
      // validate token and role server-side in production
      // call service to abort and emit
      await gameService.abortRoom(roomId, { sub: 'socket-admin' });
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

module.exports = { initSocketServer };