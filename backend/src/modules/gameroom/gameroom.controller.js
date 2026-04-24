const gameroomService = require('./gameroom.service')
const gameService = require('../game/game.service')
const {
  toAddGameroomPlayerInput,
  toCreateGameroomInput,
  toGameroomResponse,
  toStartGameroomResponse,
  toUpdateGameroomPlayersInput,
  toUpdateGameroomSettingsInput,
} = require('./gameroom.dto')
const { ErrorResponse } = require('../../shared/errors/AppErrors')

const createGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId

    const room = await gameroomService.createGameroom(userId, toCreateGameroomInput(req.body))

    res.status(201).json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const getAllGamerooms = async (_req, res, next) => {
  try {
    const rooms = await gameroomService.getAllGamerooms()

    res.json({
      ok: true,
      count: rooms.length,
      data: rooms.map(toGameroomResponse),
    })
  } catch (error) {
    next(error)
  }
}

const getGameroomById = async (req, res, next) => {
  try {
    const room = await gameroomService.getGameroomById(req.params.id)

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const getGameroomByRoomId = async (req, res, next) => {
  try {
    const room = await gameroomService.getGameroomByRoomId(req.params.roomId)

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const updateGameroomSettings = async (req, res, next) => {
  try {
    const room = await gameroomService.updateGameroomSettings(
      req.params.id,
      toUpdateGameroomSettingsInput(req.body)
    )

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const updateGameroomPlayers = async (req, res, next) => {
  try {
    const room = await gameroomService.updateGameroomPlayers(
      req.params.id,
      toUpdateGameroomPlayersInput(req.body)
    )

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const addPlayerToGameroom = async (req, res, next) => {
  try {
    const room = await gameroomService.addPlayerToGameroom(
      req.params.id,
      toAddGameroomPlayerInput(req.body)
    )

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const removePlayerFromGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId
    const room = await gameroomService.removePlayerFromGameroom(req.params.id, userId)

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

const startGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId
    const room = await gameroomService.getGameroomById(req.params.id)

    if (String(room.host) !== String(userId)) {
      return next(new ErrorResponse('Only host can start the game', 403))
    }

    const playerIds = room.players.map((player) => player.userId || player._id).filter(Boolean)
    const gameSession = await gameService.createGameSession(req.params.id, playerIds)

    await gameroomService.updateGameroomStatus(req.params.id, 'in-battle')

    res.json({
      ok: true,
      data: toStartGameroomResponse({
        room,
        gameSession,
      }),
    })
  } catch (error) {
    next(error)
  }
}

const deleteGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId
    const room = await gameroomService.getGameroomById(req.params.id)
    const normalizedUserId = userId ? String(userId) : null
    const isHost = normalizedUserId && String(room.host) === normalizedUserId
    const isParticipant = normalizedUserId && Array.isArray(room.players)
      && room.players.some((player) => String(player?.userId) === normalizedUserId)
    const canParticipantCleanup = isParticipant && ['in-battle', 'completed'].includes(room.status)

    if (!isHost && !canParticipantCleanup) {
      return next(new ErrorResponse('Only the host or a match participant can delete this room', 403))
    }

    const deletedRoom = await gameroomService.deleteGameroom(req.params.id)

    res.json({
      ok: true,
      data: toGameroomResponse(deletedRoom),
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createGameroom,
  getAllGamerooms,
  getGameroomById,
  getGameroomByRoomId,
  updateGameroomSettings,
  updateGameroomPlayers,
  addPlayerToGameroom,
  removePlayerFromGameroom,
  startGameroom,
  deleteGameroom,
}
