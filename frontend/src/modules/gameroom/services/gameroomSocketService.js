import { io } from 'socket.io-client'
import { getSocketBaseUrl } from '../../../config/api/baseUrl.js'

const SOCKET_BASE_URL = getSocketBaseUrl()

let socket = null
let joinedRoom = null

const getSocket = () => {
  if (!socket) {
    socket = io(`${SOCKET_BASE_URL}/gameroom`, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

const joinRoom = ({ roomId, playerId, playerName }) => {
  const activeSocket = getSocket()
  const nextJoinedRoom = {
    roomId: String(roomId || ''),
    playerId: String(playerId || ''),
    playerName: String(playerName || ''),
  }

  if (
    joinedRoom &&
    joinedRoom.roomId === nextJoinedRoom.roomId &&
    joinedRoom.playerId === nextJoinedRoom.playerId &&
    joinedRoom.playerName === nextJoinedRoom.playerName &&
    activeSocket.connected
  ) {
    return activeSocket
  }

  joinedRoom = nextJoinedRoom
  activeSocket.emit('join-room', { roomId, playerId, playerName })
  return activeSocket
}

const leaveRoom = (roomId) => {
  if (socket?.connected && roomId) {
    socket.emit('leave-room', { roomId })
  }

  if (joinedRoom?.roomId === String(roomId || '')) {
    joinedRoom = null
  }
}

const on = (eventName, handler) => {
  const activeSocket = getSocket()
  activeSocket.on(eventName, handler)
  return () => activeSocket.off(eventName, handler)
}

const emit = (eventName, payload) => {
  getSocket().emit(eventName, payload)
}

export const gameroomSocketService = {
  emit,
  getSocket,
  joinRoom,
  leaveRoom,
  on,
}

export default gameroomSocketService
