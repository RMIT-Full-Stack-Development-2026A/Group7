const gameroomService = require('./gameroom.service')
const { emitGameroomEvent } = require('../../socket/gameroom.socket')
const {
  toAddGameroomPlayerInput,
  toCreateGameroomInput,
  toGameroomResponse,
  toStartGameroomResponse,
  toUpdateGameroomPlayersInput,
  toUpdateGameroomSettingsInput,
} = require('./gameroom.dto')
const { ErrorResponse } = require('../../shared/errors/AppErrors')

const shouldEmitPlayersChanged = (room) => room?.$locals?.gameroomPlayersChanged !== false

const createGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId

    const room = await gameroomService.createGameroom(userId, toCreateGameroomInput(req.body))
    const roomResponse = toGameroomResponse(room)

    res.status(201).json({
      ok: true,
      data: roomResponse,
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
    const roomResponse = toGameroomResponse(room)
    if (shouldEmitPlayersChanged(room)) {
      emitGameroomEvent(room.roomId, 'room-updated', roomResponse)
    }

    res.json({
      ok: true,
      data: roomResponse,
    })
  } catch (error) {
    next(error)
  }
}

const updateGameroomPlayers = async (req, res, next) => {
  try {
    const requestedPlayers = toUpdateGameroomPlayersInput(req.body)
    const room = await gameroomService.updateGameroomPlayers(
      req.params.id,
      requestedPlayers
    )
    const roomResponse = toGameroomResponse(room)
    if (shouldEmitPlayersChanged(room)) {
      emitGameroomEvent(room.roomId, 'room-updated', roomResponse)
    }

    res.json({
      ok: true,
      data: roomResponse,
    })
  } catch (error) {
    next(error)
  }
}

const addPlayerToGameroom = async (req, res, next) => {
  try {
    const authenticatedUserId = req.user?.userId || req.user?.id
    const playerInput = toAddGameroomPlayerInput(req.body)
    const room = await gameroomService.addPlayerToGameroom(
      req.params.id,
      authenticatedUserId
        ? {
          ...playerInput,
          userId: String(authenticatedUserId),
        }
        : playerInput
    )
    const roomResponse = toGameroomResponse(room)
    if (shouldEmitPlayersChanged(room)) {
      emitGameroomEvent(room.roomId, 'room-updated', roomResponse)
    }

    res.json({
      ok: true,
      data: roomResponse,
    })
  } catch (error) {
    next(error)
  }
}

const removePlayerFromGameroom = async (req, res, next) => {
  try {
    // Bắt buộc dùng userId từ token (authenticate middleware đã verify).
    // Không cho phép body.userId override để chặn việc kick người khác.
    const userId = req.user?.userId || req.user?.id
    const room = await gameroomService.removePlayerFromGameroom(req.params.id, userId)
    const roomResponse = toGameroomResponse(room)
    if (shouldEmitPlayersChanged(room)) {
      emitGameroomEvent(room.roomId, 'room-updated', roomResponse)
    }

    res.json({
      ok: true,
      data: roomResponse,
    })
  } catch (error) {
    next(error)
  }
}

const startGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId
    let room = await gameroomService.getGameroomById(req.params.id)

    if (String(room.host) !== String(userId)) {
      return next(new ErrorResponse('Only host can start the game', 403))
    }

    const requestedPlayers = toUpdateGameroomPlayersInput(req.body)
    if (Array.isArray(requestedPlayers)) {
      room = await gameroomService.updateGameroomPlayers(req.params.id, requestedPlayers)
    }

    const activePlayers = room.players.filter(Boolean)
    const humanPlayers = activePlayers.filter((player) => player.type !== 'ai')

    if (activePlayers.length < 2) {
      return next(new ErrorResponse('Add one more player or AI before starting the game.', 400))
    }

    if (humanPlayers.length === 0) {
      return next(new ErrorResponse('At least one human player is required to start the game.', 400))
    }

    const updatedRoom = await gameroomService.updateGameroomStatus(req.params.id, 'in-battle')
    const startResponse = toStartGameroomResponse({
      room: updatedRoom,
      gameSession: null,
    })
    emitGameroomEvent(updatedRoom.roomId, 'game-started', {
      startTime: new Date(),
      payload: startResponse,
    })

    res.json({
      ok: true,
      data: startResponse,
    })
  } catch (error) {
    next(error)
  }
}

const deleteGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId
    const room = await gameroomService.getGameroomById(req.params.id)
    if (String(room.host) !== String(userId)) {
      return next(new ErrorResponse('Only host can delete the room', 403))
    }

    const deletedRoom = await gameroomService.deleteGameroom(req.params.id)
    const roomResponse = toGameroomResponse(deletedRoom)
    emitGameroomEvent(deletedRoom.roomId, 'room-deleted', roomResponse)

    res.json({
      ok: true,
      data: roomResponse,
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
