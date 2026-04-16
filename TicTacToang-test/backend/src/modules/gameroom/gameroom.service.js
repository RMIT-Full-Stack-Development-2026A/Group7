import { ErrorResponse } from '../../shared/errors/AppErrors.js'
import * as gameroomRepository from './gameroom.repository.js'

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

export const createGameroom = async (userId, roomData) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink } = roomData
  const roomId = await generateUniqueRoomId()

  return gameroomRepository.createGameroom({
    roomId,
    roomName,
    size,
    host: userId,
    gameSettings: {
      boardStyle: boardStyle || 'Classic',
      boardSize: boardSize || '10x10',
      marker: marker || defaultMarkerBySize[size] || 'X-O',
      timeToThink: timeToThink || 60,
    },
    players: [
      {
        userId,
        name: 'Host',
        type: 'human',
      },
    ],
  })
}

export const getAllGamerooms = async () => gameroomRepository.findAllGamerooms()

export const getGameroomById = async (roomId) => {
  const room = await gameroomRepository.findByMongoId(roomId)

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}

export const getGameroomByRoomId = async (roomId) => {
  const room = await gameroomRepository.findByRoomId(roomId)

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}

export const updateGameroomSettings = async (roomId, settings) => {
  const room = await gameroomRepository.updateGameroomById(roomId, {
    gameSettings: settings,
  })

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}

export const updateGameroomPlayers = async (roomId, players) => {
  const room = await getGameroomById(roomId)

  if (!Array.isArray(players)) {
    throw new ErrorResponse('Invalid players payload', 400)
  }

  if (players.length > room.size) {
    throw new ErrorResponse('Too many players for this room', 400)
  }

  room.players = players
  await room.save()

  return room
}

export const addPlayerToGameroom = async (roomId, playerData) => {
  const room = await getGameroomById(roomId)

  if (room.players.length >= room.size) {
    throw new ErrorResponse('Room is full', 400)
  }

  room.players.push(playerData)
  await room.save()

  return room
}

export const updateGameroomStatus = async (roomId, status) => {
  const room = await gameroomRepository.updateGameroomById(roomId, { status })

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}

export const deleteGameroom = async (roomId) => {
  const room = await gameroomRepository.deleteGameroomById(roomId)

  if (!room) {
    throw new ErrorResponse('Room not found', 404)
  }

  return room
}
