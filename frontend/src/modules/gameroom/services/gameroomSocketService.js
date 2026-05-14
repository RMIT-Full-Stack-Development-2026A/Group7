import { io } from 'socket.io-client'
import { getSocketBaseUrl } from '../../../config/api/baseUrl.js'

const SOCKET_BASE_URL = getSocketBaseUrl()

let socket = null

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
  activeSocket.emit('join-room', { roomId, playerId, playerName })
  return activeSocket
}

const leaveRoom = (roomId) => {
  if (socket?.connected && roomId) {
    socket.emit('leave-room', { roomId })
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
