const { isAllowedOrigin } = require('../config/cors')
const Gameroom = require('../modules/gameroom/gameroom.model')

let ioInstance = null
const MAX_CHAT_MESSAGE_LENGTH = 500

const normalizeChatMessage = (message = {}) => ({
  id: String(message.id || ''),
  senderId: String(message.senderId || ''),
  senderName: String(message.senderName || 'Player').trim() || 'Player',
  text: String(message.text || '').trim(),
  createdAt: message.createdAt || new Date(),
})

const getRoomChatMessages = async (roomId) => {
  if (!roomId) {
    return []
  }

  const room = await Gameroom.findOne({ roomId: Number(roomId) })
    .select('chatMessages')
    .lean()
    .catch(() => null)

  return (room?.chatMessages || [])
    .map(normalizeChatMessage)
    .filter((message) => message.id && message.text)
}

const appendRoomChatMessage = async ({ roomId, senderId, senderName, text }) => {
  const cleanText = String(text || '').trim().slice(0, MAX_CHAT_MESSAGE_LENGTH)
  if (!roomId || !cleanText) {
    return null
  }

  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    senderId: String(senderId || 'anonymous'),
    senderName: String(senderName || 'Player').trim() || 'Player',
    text: cleanText,
    createdAt: new Date(),
  }

  const room = await Gameroom.findOneAndUpdate(
    { roomId: Number(roomId) },
    { $push: { chatMessages: message } },
    { new: true, projection: { _id: 1 } }
  ).lean().catch(() => null)

  return room ? message : null
}

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

      getRoomChatMessages(roomId).then((messages) => {
        socket.emit('chat-history', {
          roomId,
          messages,
        });
      });
    });

    socket.on('chat-message', async (data = {}) => {
      const { roomId, senderId, senderName, text } = data;
      const roomKey = `room:${roomId}`;
      if (!roomId || !socket.rooms.has(roomKey)) {
        return;
      }

      const message = await appendRoomChatMessage({
        roomId,
        senderId,
        senderName,
        text,
      });

      if (!message) {
        return;
      }

      gameNamespace.to(roomKey).emit('chat-message', {
        roomId,
        message,
      });
    });

    socket.on('request-chat-history', (data = {}) => {
      const { roomId } = data;
      const roomKey = `room:${roomId}`;
      if (!roomId || !socket.rooms.has(roomKey)) {
        return;
      }

      getRoomChatMessages(roomId).then((messages) => {
        socket.emit('chat-history', {
          roomId,
          messages,
        });
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

    socket.on('room-invite-approval-request', (data = {}) => {
      const { roomId } = data;
      if (!roomId) {
        return;
      }

      gameNamespace.to(`room:${roomId}`).emit('room-invite-approval-request', {
        ...data,
        socketId: socket.id,
      });
    });

    socket.on('room-invite-approval-response', (data = {}) => {
      const { roomId } = data;
      if (!roomId) {
        return;
      }

      gameNamespace.to(`room:${roomId}`).emit('room-invite-approval-response', data);
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

  if (eventName === 'room-deleted') {
    Gameroom.updateOne({ roomId: Number(roomId) }, { $set: { chatMessages: [] } }).catch(() => null)
  }

  ioInstance.of('/gameroom').to(`room:${roomId}`).emit(eventName, payload)
}

module.exports = {
  initGameroomSocketServer,
  getIO,
  emitGameroomEvent,
};
