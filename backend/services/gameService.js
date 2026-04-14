const GameSession = require('../models/GameSession');
const Room = require('../models/Room');
const { ErrorResponse } = require('../utils/errorResponse');

const createGameSession = async (roomId, playerIds) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new ErrorResponse('Room not found', 404);
    }
    
    const gameSession = new GameSession({
      roomId,
      players: playerIds,
      startTime: new Date(),
      status: 'in-progress',
    });
    
    await gameSession.save();
    return gameSession.populate('players');
  } catch (error) {
    throw error;
  }
};

const getGameSession = async (sessionId) => {
  try {
    const gameSession = await GameSession.findById(sessionId)
      .populate('players')
      .populate('roomId');
    
    if (!gameSession) {
      throw new ErrorResponse('Game session not found', 404);
    }
    
    return gameSession;
  } catch (error) {
    throw error;
  }
};

const updateGameStatus = async (sessionId, status) => {
  try {
    const gameSession = await GameSession.findByIdAndUpdate(
      sessionId,
      { status, endTime: status === 'completed' ? new Date() : undefined },
      { new: true, runValidators: true }
    );
    
    if (!gameSession) {
      throw new ErrorResponse('Game session not found', 404);
    }
    
    return gameSession;
  } catch (error) {
    throw error;
  }
};

const updateGameScore = async (sessionId, playerId, score) => {
  try {
    const gameSession = await GameSession.findById(sessionId);
    if (!gameSession) {
      throw new ErrorResponse('Game session not found', 404);
    }
    
    gameSession.scores.set(playerId.toString(), score);
    await gameSession.save();
    
    return gameSession;
  } catch (error) {
    throw error;
  }
};

const setWinner = async (sessionId, winnerId) => {
  try {
    const gameSession = await GameSession.findByIdAndUpdate(
      sessionId,
      { winner: winnerId },
      { new: true }
    );
    
    if (!gameSession) {
      throw new ErrorResponse('Game session not found', 404);
    }
    
    return gameSession;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createGameSession,
  getGameSession,
  updateGameStatus,
  updateGameScore,
  setWinner,
};
