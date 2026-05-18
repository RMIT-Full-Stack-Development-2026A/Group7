const socialService = require('./social.service')
const { emitGameroomEvent } = require('../../socket/gameroom.socket')
const { toGameroomResponse } = require('../gameroom/gameroom.dto')

const getAuthenticatedUserId = (req) => String(req.user?.userId || req.user?.id || '')

const getSummary = async (req, res, next) => {
  try {
    const summary = await socialService.getSummary(getAuthenticatedUserId(req))
    res.json({ ok: true, data: summary })
  } catch (error) {
    next(error)
  }
}

const getPlayers = async (req, res, next) => {
  try {
    const players = await socialService.listPlayers(getAuthenticatedUserId(req))
    res.json({ ok: true, data: players })
  } catch (error) {
    next(error)
  }
}

const updatePresence = async (req, res, next) => {
  try {
    const user = await socialService.updatePresence(
      getAuthenticatedUserId(req),
      req.body?.online !== false
    )
    res.json({ ok: true, data: user })
  } catch (error) {
    next(error)
  }
}

const sendFriendRequest = async (req, res, next) => {
  try {
    const request = await socialService.sendFriendRequest(
      getAuthenticatedUserId(req),
      String(req.body?.recipientId || '')
    )
    res.status(201).json({ ok: true, data: request })
  } catch (error) {
    next(error)
  }
}

const acceptFriendRequest = async (req, res, next) => {
  try {
    const summary = await socialService.acceptFriendRequest(getAuthenticatedUserId(req), req.params.id)
    res.json({ ok: true, data: summary })
  } catch (error) {
    next(error)
  }
}

const declineFriendRequest = async (req, res, next) => {
  try {
    const summary = await socialService.declineFriendRequest(getAuthenticatedUserId(req), req.params.id)
    res.json({ ok: true, data: summary })
  } catch (error) {
    next(error)
  }
}

const sendRoomInvite = async (req, res, next) => {
  try {
    const invite = await socialService.sendRoomInvite(
      getAuthenticatedUserId(req),
      String(req.body?.recipientId || ''),
      String(req.body?.roomMongoId || '')
    )
    res.status(201).json({ ok: true, data: invite })
  } catch (error) {
    next(error)
  }
}

const acceptRoomInvite = async (req, res, next) => {
  try {
    const result = await socialService.acceptRoomInvite(getAuthenticatedUserId(req), req.params.id)
    if (result?.room?.roomId) {
      emitGameroomEvent(result.room.roomId, 'room-updated', toGameroomResponse(result.room))
    }
    res.json({ ok: true, data: result })
  } catch (error) {
    next(error)
  }
}

const declineRoomInvite = async (req, res, next) => {
  try {
    const summary = await socialService.declineRoomInvite(getAuthenticatedUserId(req), req.params.id)
    res.json({ ok: true, data: summary })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getSummary,
  getPlayers,
  updatePresence,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  sendRoomInvite,
  acceptRoomInvite,
  declineRoomInvite,
}
