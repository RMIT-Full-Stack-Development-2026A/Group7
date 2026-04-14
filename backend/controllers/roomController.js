const roomService = require('../services/roomService');
const gameService = require('../services/gameService');
const { ErrorResponse } = require('../utils/errorResponse');

const createRoom = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId || 'anonymous_user';
    if (!userId) {
      return next(new ErrorResponse('User ID or room data required', 400));
    }
    
    const room = await roomService.createRoom(userId, req.body);
    res.status(201).json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomService.getRoomById(id);
    res.json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const getRoomByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await roomService.getRoomByRoomId(roomId);
    res.json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const updateRoomSettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomService.updateRoomSettings(id, req.body.gameSettings);
    res.json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const updateRoomPlayers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomService.updateRoomPlayers(id, req.body.players);
    res.json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const addPlayerToRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { playerData } = req.body;
    
    const room = await roomService.addPlayerToRoom(id, playerData);
    res.json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const startGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId;
    
    const room = await roomService.getRoomById(id);
    
    // Verify user is host
    if (room.host !== userId) {
      return next(new ErrorResponse('Only host can start the game', 403));
    }
    
    // Create game session
    const playerIds = room.players.map(p => p.userId || p._id).filter(Boolean);
    const gameSession = await gameService.createGameSession(id, playerIds);
    
    // Update room status
    await roomService.updateRoomStatus(id, 'started');
    
    res.json({
      ok: true,
      data: {
        room,
        gameSession,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomService.deleteRoom(id);
    res.json({
      ok: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRoomById,
  getRoomByRoomId,
  updateRoomSettings,
  updateRoomPlayers,
  addPlayerToRoom,
  startGame,
  deleteRoom,
};
