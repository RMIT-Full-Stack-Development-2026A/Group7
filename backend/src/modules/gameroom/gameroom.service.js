const { ErrorResponse } = require('../../shared/errors/AppErrors')
const gameroomRepository = require('./gameroom.repository')
const User = require('../auth/auth.model')

const defaultMarkerBySize = {
  2: 'X-O',
  3: 'X-O-Triangle',
  4: 'X-O-Triangle-Square',
}

const generateRandomRoomId = () =>
  Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000

const generateUniqueRoomId = async () => {
  let roomId
  let isUnique = false

  while (!isUnique) {
    roomId = generateRandomRoomId()
    const existingRoom = await gameroomRepository.findByRoomId(roomId)
    if (!existingRoom) {
      isUnique = true
    }
  }

  return roomId
}

const buildHostPlayerFromUser = (user) => {
  if (!user?._id) {
    return null
  }

  return {
    userId: String(user._id),
    name: user.name || user.username || 'Host',
    avatar: user.avatar || '',
    type: 'human',
  }
}

const setPlayersChanged = (room, changed) => {
  if (room?.$locals) {
    room.$locals.gameroomPlayersChanged = Boolean(changed)
  }
}

const normalizePlayerForCompare = (player = {}) => ({
  userId: String(player.userId || ''),
  name: String(player.name || ''),
  avatar: String(player.avatar || ''),
  type: player.type || 'human',
  aiDifficulty: player.aiDifficulty || '',
})

const arePlayerListsEqual = (currentPlayers = [], nextPlayers = []) =>
  JSON.stringify(currentPlayers.map(normalizePlayerForCompare)) === JSON.stringify(nextPlayers.map(normalizePlayerForCompare))

const findUserByIdentity = async ({ userId, username, email } = {}) => {
  const filters = []

  if (userId) filters.push({ _id: userId })
  if (username) filters.push({ username: String(username).trim() })
  if (email) filters.push({ email: String(email).trim().toLowerCase() })

  for (const filter of filters) {
    const user = await User.findOne(filter).lean().catch(() => null)
    if (user) return user
  }

  return null
}

const ensureHostPlayerPresent = async (room) => {
  if (!room?.host) {
    return room
  }

  const hostUserId = String(room.host)
  const hostUser = await User.findById(hostUserId).lean().catch(() => null)
  const hostPlayer = buildHostPlayerFromUser(hostUser)
  const hasHostPlayer = Array.isArray(room.players)
    && room.players.some((player) => String(player?.userId) === hostUserId)

  if (Array.isArray(room.players) && hasHostPlayer) {
    const hostName = String(hostPlayer?.name || '').trim().toLowerCase()
    const originalLength = room.players.length
    room.players = room.players.filter((player) => {
      if (String(player?.userId) === hostUserId) {
        return true
      }

      const playerName = String(player?.name || '').trim().toLowerCase()
      return !(hostName && playerName === hostName && player?.type !== 'ai')
    })

    if (room.players.length !== originalLength) {
      await room.save()
      setPlayersChanged(room, true)
    }

    return room
  }

  if (!hostPlayer) {
    return room
  }

  room.players = [hostPlayer, ...(Array.isArray(room.players) ? room.players : [])].slice(0, room.size)
  await room.save()
  setPlayersChanged(room, true)

  return room
}

const createGameroom = async (userId, roomData) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink, username, email, hostName, hostAvatar } = roomData
  const roomId = await generateUniqueRoomId()
  const authUser = await findUserByIdentity({ userId, username, email })

  if (!authUser) {
    throw new ErrorResponse('Authenticated user not found', 404)
  }

  const resolvedUserId = String(authUser._id)
  const resolvedHostName = hostName || authUser?.name || authUser?.username
  const resolvedHostAvatar = hostAvatar || authUser?.avatar || ''

  return gameroomRepository.createGameroom({
    roomId,
    roomName,
    size,
    host: resolvedUserId,
    gameSettings: {
      boardStyle: boardStyle || 'Classic',
      boardSize: boardSize || '10x10',
      marker: marker || defaultMarkerBySize[size] || 'X-O',
      timeToThink: timeToThink || 60,
    },
    players: [
      {
        userId: resolvedUserId,
        name: resolvedHostName,
        avatar: resolvedHostAvatar,
        type: 'human',
      },
    ],
  })
}

const getAllGamerooms = async () => gameroomRepository.findAllGamerooms()
  .then((rooms) => Promise.all(rooms.map((room) => ensureHostPlayerPresent(room))))

const getGameroomById = async (roomId) => {
  const room = await gameroomRepository.findByMongoId(roomId)

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return ensureHostPlayerPresent(room)
}

const getGameroomByRoomId = async (roomId) => {
  const room = await gameroomRepository.findByRoomId(roomId)

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return ensureHostPlayerPresent(room)
}

const updateGameroomSettings = async (roomId, settings) => {
  const room = await gameroomRepository.updateGameroomById(roomId, {
    gameSettings: settings,
  })

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}

const updateGameroomPlayers = async (roomId, players) => {
  const room = await getGameroomById(roomId)

  if (!Array.isArray(players)) {
    throw new ErrorResponse('Invalid players payload', 400)
  }

  if (players.length > room.size) {
    throw new ErrorResponse('Too many players for this room', 400)
  }

  const hostUserId = room.host ? String(room.host) : null
  let nextPlayers = Array.isArray(players) ? [...players] : []

  if (hostUserId && !nextPlayers.some((player) => String(player?.userId) === hostUserId)) {
    const hostUser = await User.findById(hostUserId).lean().catch(() => null)
    const hostPlayer = buildHostPlayerFromUser(hostUser)

    if (hostPlayer) {
      nextPlayers = [hostPlayer, ...nextPlayers]
    }
  }

  nextPlayers = nextPlayers.slice(0, room.size)

  if (arePlayerListsEqual(room.players || [], nextPlayers)) {
    setPlayersChanged(room, false)
    return ensureHostPlayerPresent(room)
  }

  room.players = nextPlayers
  await room.save()
  setPlayersChanged(room, true)

  return ensureHostPlayerPresent(room)
}

const addPlayerToGameroom = async (roomId, playerData) => {
  const room = await getGameroomById(roomId)
  const incomingUserId = playerData?.userId ? String(playerData.userId) : null
  const hostUserId = room.host ? String(room.host) : null

  if (incomingUserId) {
    if (hostUserId && incomingUserId === hostUserId) {
      setPlayersChanged(room, false)
      return ensureHostPlayerPresent(room)
    }

    const existingPlayer = room.players.find((player) => String(player.userId) === incomingUserId)
    if (existingPlayer) {
      setPlayersChanged(room, false)
      return room
    }
  }

  if (room.players.length >= room.size) {
    throw new ErrorResponse('Room is full', 400)
  }

  room.players.push(playerData)
  await room.save()
  setPlayersChanged(room, true)

  return ensureHostPlayerPresent(room)
}

const removePlayerFromGameroom = async (roomId, userId) => {
  const room = await getGameroomById(roomId)
  const normalizedUserId = userId ? String(userId) : null

  if (!normalizedUserId) {
    throw new ErrorResponse('User id is required', 400)
  }

  if (String(room.host) === normalizedUserId) {
    setPlayersChanged(room, false)
    return room
  }

  const nextPlayers = (room.players || []).filter((player) => String(player?.userId) !== normalizedUserId)

  if (arePlayerListsEqual(room.players || [], nextPlayers)) {
    setPlayersChanged(room, false)
    return room
  }

  room.players = nextPlayers
  await room.save()
  setPlayersChanged(room, true)

  return ensureHostPlayerPresent(room)
}

const updateGameroomStatus = async (roomId, status) => {
  const room = await gameroomRepository.updateGameroomById(roomId, { status })

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}

const deleteGameroom = async (roomId) => {
  const room = await gameroomRepository.deleteGameroomById(roomId)

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
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
}
