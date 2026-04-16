import * as gameroomService from './gameroom.service.js'
import * as gameService from '../game/game.service.js'
import {
  toAddGameroomPlayerInput,
  toCreateGameroomInput,
  toGameroomResponse,
  toStartGameroomResponse,
  toUpdateGameroomPlayersInput,
  toUpdateGameroomSettingsInput,
} from './gameroom.dto.js'
import { ErrorResponse } from '../../shared/errors/AppErrors.js'

export const createGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId || 'anonymous_user'
    const room = await gameroomService.createGameroom(userId, toCreateGameroomInput(req.body))

    res.status(201).json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}

export const getAllGamerooms = async (_req, res, next) => {
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

export const getGameroomById = async (req, res, next) => {
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

export const getGameroomByRoomId = async (req, res, next) => {
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

export const updateGameroomSettings = async (req, res, next) => {
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

export const updateGameroomPlayers = async (req, res, next) => {
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

export const addPlayerToGameroom = async (req, res, next) => {
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

export const startGameroom = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId
    const room = await gameroomService.getGameroomById(req.params.id)

    if (room.host !== userId) {
      return next(new ErrorResponse('Only host can start the game', 403))
    }

    const playerIds = room.players.map((player) => player.userId || player._id).filter(Boolean)
    const gameSession = await gameService.createGameSession(req.params.id, playerIds)

    await gameroomService.updateGameroomStatus(req.params.id, 'started')

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

export const deleteGameroom = async (req, res, next) => {
  try {
    const room = await gameroomService.deleteGameroom(req.params.id)

    res.json({
      ok: true,
      data: toGameroomResponse(room),
    })
  } catch (error) {
    next(error)
  }
}
