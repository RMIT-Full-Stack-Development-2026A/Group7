import Game from './game.model.js'
import Gameroom from '../gameroom/gameroom.model.js'
import { ErrorResponse } from '../../shared/errors/AppErrors.js'

export const createGameSession = async (roomId, playerIds) => {
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

export const getGameSession = async (sessionId) => {
  const gameSession = await Game.findById(sessionId).populate('players').populate('roomId')

  if (!gameSession) {
    throw new ErrorResponse('Game session not found', 404)
  }

  return gameSession
}

export const updateGameStatus = async (sessionId, status) => {
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

export const updateGameScore = async (sessionId, playerId, score) => {
  const gameSession = await Game.findById(sessionId)
  if (!gameSession) {
    throw new ErrorResponse('Game session not found', 404)
  }

  gameSession.scores.set(playerId.toString(), score)
  await gameSession.save()

  return gameSession
}

export const setWinner = async (sessionId, winnerId) => {
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
