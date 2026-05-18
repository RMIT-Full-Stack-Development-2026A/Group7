const { ErrorResponse } = require('../../shared/errors/AppErrors')
const gameroomRepository = require('./gameroom.repository')
const User = require('../auth/auth.model')
const {
  DEFAULT_MARKER_BY_SIZE,
  MAX_CHAT_MESSAGE_LENGTH,
  generateUniqueRoomId,
  normalizeMarker,
  generateUniqueMarkerColor,
  getFallbackMarkerParts,
  withPlayerMarkerIdentity,
  buildHostPlayerFromUser,
  setPlayersChanged,
  arePlayerListsEqual,
  normalizeChatMessage,
  getRoomChatMessages,
  findUserByIdentity,
  normalizeRoomPlayers,
  resolveUserIdFromRequest,
} = require('./gameroom.service.helpers')

const ensureHostPlayerPresent = async (room) => {
  if (!room?.host) return room

  const hostUserId = String(room.host)
  const hostUser = await User.findById(hostUserId).lean().catch(() => null)
  const currentHostPlayer = (room.players || []).find((player) => String(player?.userId) === hostUserId)
  const hostPlayer = buildHostPlayerFromUser(
    hostUser,
    currentHostPlayer?.marker || room.gameSettings?.marker || 'X',
    currentHostPlayer?.markerColor || ''
  )

  if (!hostPlayer && !Array.isArray(room.players)) return room

  const nextPlayers = withPlayerMarkerIdentity(
    await normalizeRoomPlayers(room, hostPlayer),
    room.players || [],
    getFallbackMarkerParts(room.gameSettings?.marker)
  )

  if (arePlayerListsEqual(room.players || [], nextPlayers)) {
    setPlayersChanged(room, false)
    return room
  }

  room.players = nextPlayers
  await room.save()
  setPlayersChanged(room, true)
  return room
}

const createGameroom = async (userId, roomData) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink, hostPosition, username, email, hostName, hostAvatar } = roomData
  const roomId = await generateUniqueRoomId()
  const authUser = await findUserByIdentity({ userId, username, email })

  if (!authUser) throw new ErrorResponse('Authenticated user not found', 404)

  const resolvedUserId = String(authUser._id)
  const parsedHostPosition = Number(hostPosition)
  const resolvedHostPosition = Number.isInteger(parsedHostPosition)
    && parsedHostPosition >= 1
    && parsedHostPosition <= Number(size)
    ? parsedHostPosition
    : null
  const resolvedMarker = normalizeMarker(marker) || DEFAULT_MARKER_BY_SIZE[size] || 'X'

  return gameroomRepository.createGameroom({
    roomId,
    roomName,
    size,
    host: resolvedUserId,
    gameSettings: {
      boardStyle: boardStyle || 'Classic',
      boardSize: boardSize || '10x10',
      marker: resolvedMarker,
      timeToThink: timeToThink || 60,
      hostPosition: resolvedHostPosition,
    },
    players: [
      {
        userId: resolvedUserId,
        name: hostName || authUser?.name || authUser?.username,
        avatar: hostAvatar || authUser?.avatar || '',
        type: 'human',
        marker: resolvedMarker,
        markerColor: generateUniqueMarkerColor(),
      },
    ],
  })
}

const getAllGamerooms = async () => gameroomRepository.findAllGamerooms()
  .then((rooms) => Promise.all(rooms.map((room) => ensureHostPlayerPresent(room))))

const getGameroomById = async (roomId) => {
  const room = await gameroomRepository.findByMongoId(roomId)
  if (!room) throw new ErrorResponse('Room not found', 404)
  return ensureHostPlayerPresent(room)
}

const getGameroomByRoomId = async (roomId) => {
  const room = await gameroomRepository.findByRoomId(roomId)
  if (!room) throw new ErrorResponse('Room not found', 404)
  return ensureHostPlayerPresent(room)
}

const updateGameroomSettings = async (roomId, settings) => {
  const room = await gameroomRepository.updateGameroomById(roomId, { gameSettings: settings })
  if (!room) throw new ErrorResponse('Room not found', 404)
  return room
}

const updateGameroomPlayers = async (roomId, players) => {
  const room = await getGameroomById(roomId)

  if (!Array.isArray(players)) throw new ErrorResponse('Invalid players payload', 400)
  if (players.length > room.size) throw new ErrorResponse('Too many players for this room', 400)

  const hostUserId = room.host ? String(room.host) : null
  let nextPlayers = Array.isArray(players) ? [...players] : []

  if (hostUserId && !nextPlayers.some((player) => String(player?.userId) === hostUserId)) {
    const hostUser = await User.findById(hostUserId).lean().catch(() => null)
    const existing = (room.players || []).find((player) => String(player?.userId) === hostUserId)
    const hostPlayer = buildHostPlayerFromUser(
      hostUser,
      existing?.marker || room.gameSettings?.marker || 'X',
      existing?.markerColor || ''
    )
    if (hostPlayer) nextPlayers = [hostPlayer, ...nextPlayers]
  }

  const nextPlayerUserIds = new Set(nextPlayers.map((player) => String(player?.userId || '')).filter(Boolean))
  const preservedHumanGuests = (room.players || []).filter((player) => {
    const playerUserId = String(player?.userId || '')
    return player?.type !== 'ai'
      && playerUserId
      && playerUserId !== hostUserId
      && !nextPlayerUserIds.has(playerUserId)
  })

  nextPlayers = withPlayerMarkerIdentity(
    [...nextPlayers, ...preservedHumanGuests].slice(0, room.size),
    room.players || []
  )

  if (arePlayerListsEqual(room.players || [], nextPlayers)) {
    setPlayersChanged(room, false)
    return ensureHostPlayerPresent(room)
  }

  const updatedRoom = await gameroomRepository.updateGameroomById(roomId, { players: nextPlayers })
  setPlayersChanged(updatedRoom, true)
  return ensureHostPlayerPresent(updatedRoom)
}

const addPlayerToGameroom = async (roomId, playerData) => {
  const room = await getGameroomById(roomId)
  const incomingUserId = playerData?.userId ? String(playerData.userId) : null

  if (incomingUserId && room.players.find((player) => String(player.userId) === incomingUserId)) {
    setPlayersChanged(room, false)
    return room
  }

  if (room.players.length >= room.size) throw new ErrorResponse('Room is full', 400)

  room.players = withPlayerMarkerIdentity([...(room.players || []), playerData], room.players || [])
  await room.save()
  setPlayersChanged(room, true)
  return ensureHostPlayerPresent(room)
}

const removePlayerFromGameroom = async (roomId, userId) => {
  const room = await getGameroomById(roomId)
  const normalizedUserId = userId ? String(userId) : null

  if (!normalizedUserId) throw new ErrorResponse('User id is required', 400)

  const nextPlayers = (room.players || []).filter((player) => String(player?.userId) !== normalizedUserId)

  if (arePlayerListsEqual(room.players || [], nextPlayers)) {
    setPlayersChanged(room, false)
    return room
  }

  if (String(room.host) === normalizedUserId) {
    const hasRemainingHumanPlayer = nextPlayers.some((player) => player?.type !== 'ai')
    if (!hasRemainingHumanPlayer) {
      await room.deleteOne()
      room.players = nextPlayers
      room.$locals.gameroomDeleted = true
      setPlayersChanged(room, true)
      return room
    }
  }

  room.players = nextPlayers
  await room.save()
  setPlayersChanged(room, true)
  return ensureHostPlayerPresent(room)
}

const updateGameroomStatus = async (roomId, status) => {
  const update = { status }
  const now = new Date()
  if (status === 'in-battle') update.startedAt = now
  if (status === 'completed') update.endedAt = now

  const room = await gameroomRepository.updateGameroomById(roomId, update)
  if (!room) throw new ErrorResponse('Room not found', 404)
  return room
}

const deleteGameroom = async (roomId) => {
  const room = await gameroomRepository.deleteGameroomById(roomId)
  if (!room) throw new ErrorResponse('Room not found', 404)
  return room
}

const getGameroomChatMessages = async (roomId) => {
  const room = await getGameroomById(roomId)
  return getRoomChatMessages(room)
}

const addGameroomChatMessage = async (roomId, messageData = {}) => {
  const text = String(messageData.text || '').trim().slice(0, MAX_CHAT_MESSAGE_LENGTH)
  if (!text) throw new ErrorResponse('Message text is required', 400)

  const room = await getGameroomById(roomId)
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    senderId: String(messageData.senderId || 'anonymous'),
    senderName: String(messageData.senderName || 'Player').trim() || 'Player',
    text,
    createdAt: new Date(),
  }

  room.chatMessages = [...(room.chatMessages || []), message]
  await room.save()
  return normalizeChatMessage(message)
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
  updateGameroomStatus,
  deleteGameroom,
  getGameroomChatMessages,
  addGameroomChatMessage,
  resolveUserIdFromRequest,
}
