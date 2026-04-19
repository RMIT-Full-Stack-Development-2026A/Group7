const Game = require('./game.model')
const Gameroom = require('../gameroom/gameroom.model')
const { ErrorResponse } = require('../../shared/errors/AppErrors')

const createGameSession = async (roomId, playerIds) => {
  const room = await Gameroom.findById(roomId)
  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  const gameSession = new Game({
    roomId,
    players: playerIds,
    startTime: new Date(),
    status: 'in-progress',
  })

  await gameSession.save()
  return gameSession.populate('players')
}

const getGameSession = async (sessionId) => {
  const gameSession = await Game.findById(sessionId).populate('players').populate('roomId')

  if (!gameSession) {
    throw new ErrorResponse('Game session not found', 404)
  }

  return gameSession
}

const updateGameStatus = async (sessionId, status) => {
  const gameSession = await Game.findByIdAndUpdate(
    sessionId,
    { status, endTime: status === 'completed' ? new Date() : undefined },
    { new: true, runValidators: true }
  )

  if (!gameSession) {
    throw new ErrorResponse('Game session not found', 404)
  }

  return gameSession
}

const updateGameScore = async (sessionId, playerId, score) => {
  const gameSession = await Game.findById(sessionId)
  if (!gameSession) {
    throw new ErrorResponse('Game session not found', 404)
  }

  gameSession.scores.set(playerId.toString(), score)
  await gameSession.save()

  return gameSession
}

const setWinner = async (sessionId, winnerId) => {
  const gameSession = await Game.findByIdAndUpdate(
    sessionId,
    { winner: winnerId },
    { new: true }
  )

  if (!gameSession) {
    throw new ErrorResponse('Game session not found', 404)
  }

  return gameSession
}

module.exports = {
  createGameSession,
  getGameSession,
  updateGameStatus,
  updateGameScore,
  setWinner,
}
