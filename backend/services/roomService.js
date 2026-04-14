const Room = require('../models/Room');
const { ErrorResponse } = require('../utils/errorResponse');

const defaultMarkerBySize = {
  2: 'X-O',
  3: 'X-O-Triangle',
  4: 'X-O-Triangle-Square',
};

const generateRandomRoomId = () => {
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
};

const createRoom = async (userId, roomData) => {
  try {
    const { roomName, size, boardStyle, boardSize, marker, timeToThink } = roomData;
    
    // Generate unique room ID
    let roomId;
    let isUnique = false;
    while (!isUnique) {
      roomId = generateRandomRoomId();
      const existingRoom = await Room.findOne({ roomId });
      if (!existingRoom) {
        isUnique = true;
      }
    }
    
    const room = new Room({
      roomId,
      roomName,
      size,
      host: userId,
      gameSettings: {
        boardStyle: boardStyle || 'Classic',
        boardSize: boardSize || '10x10',
        marker: marker || defaultMarkerBySize[size] || 'X-O',
        timeToThink: timeToThink || 60,
      },
      players: [
        {
          userId,
          name: 'Host',
          type: 'human',
        },
      ],
    });
    
    await room.save();
    return room;
  } catch (error) {
    throw error;
  }
};

const getRoomById = async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    return room;
  } catch (error) {
    throw error;
  }
};

const getRoomByRoomId = async (roomId) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    return room;
  } catch (error) {
    throw error;
  }
};

const updateRoomSettings = async (roomId, settings) => {
  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { gameSettings: settings },
      { new: true, runValidators: true }
    );
    
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    
    return room;
  } catch (error) {
    throw error;
  }
};

const updateRoomPlayers = async (roomId, players) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }

    if (!Array.isArray(players)) {
      throw new ErrorResponse('Invalid players payload', 400);
    }

    if (players.length > room.size) {
      throw new ErrorResponse('Too many players for this room', 400);
    }

    room.players = players;
    await room.save();

    return room;
  } catch (error) {
    throw error;
  }
};

const addPlayerToRoom = async (roomId, playerData) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    
    if (room.players.length >= room.size) {
      throw new ErrorResponse('Room is full', 400);
    }
    
    room.players.push(playerData);
    await room.save();
    
    return room;
  } catch (error) {
    throw error;
  }
};

const updateRoomStatus = async (roomId, status) => {
  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    
    return room;
  } catch (error) {
    throw error;
  }
};

const deleteRoom = async (roomId) => {
  try {
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    return room;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createRoom,
  getRoomById,
  getRoomByRoomId,
  updateRoomSettings,
  updateRoomPlayers,
  addPlayerToRoom,
  updateRoomStatus,
  deleteRoom,
};
