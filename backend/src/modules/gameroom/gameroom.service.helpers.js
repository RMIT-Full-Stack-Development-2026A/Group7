// Marker / chat / player-list helpers shared by gameroom.service.js.
// Pure-ish: only DB call is through the User model for identity lookups.
const mongoose = require('mongoose')
const gameroomRepository = require('./gameroom.repository')
const User = require('../auth/auth.model')

const DEFAULT_MARKER_BY_SIZE = { 2: 'X', 3: 'X', 4: 'X' }

const SAFE_MARKERS = ['X', 'O', 'Circle', 'Star', 'Triangle', 'Heart']

const MARKER_COLOR_POOL = [
  '#ff8a76', '#89a9ff', '#7ef0b7', '#ffd36e',
  '#f48cff', '#5ed1ff', '#f97316', '#22c55e',
]

const MAX_CHAT_MESSAGE_LENGTH = 500

const generateRandomRoomId = () =>
  Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000

const generateUniqueRoomId = async () => {
  while (true) {
    const roomId = generateRandomRoomId()
    const existing = await gameroomRepository.findByRoomId(roomId)
    if (!existing) return roomId
  }
}

const normalizeMarker = (marker) => {
  const normalized = String(marker || '').trim()
  return SAFE_MARKERS.includes(normalized) ? normalized : ''
}

const normalizeMarkerColor = (color) => {
  const normalized = String(color || '').trim()
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : ''
}

const generateUniqueMarkerColor = (usedColors = new Set()) => {
  const available = MARKER_COLOR_POOL.filter((c) => !usedColors.has(c.toLowerCase()))
  if (available.length) {
    return available[Math.floor(Math.random() * available.length)]
  }
  let color = ''
  do {
    color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
  } while (usedColors.has(color.toLowerCase()))
  return color
}

const getFallbackMarkerParts = (marker = '') => String(marker || '')
  .split('-')
  .map((part) => normalizeMarker(part))
  .filter(Boolean)

const withPlayerMarkerIdentity = (players = [], currentPlayers = [], fallbackMarkers = []) => {
  const existingByUserId = new Map(
    currentPlayers
      .filter((player) => player?.userId)
      .map((player) => [String(player.userId), player])
  )
  const usedColors = new Set()

  return players.map((player, index) => {
    const plainPlayer = typeof player?.toObject === 'function' ? player.toObject() : { ...player }
    const userId = String(player?.userId || '')
    const existing = userId ? existingByUserId.get(userId) : currentPlayers[index]
    const marker = normalizeMarker(player?.marker)
      || normalizeMarker(existing?.marker)
      || normalizeMarker(fallbackMarkers[index])
    let markerColor = normalizeMarkerColor(player?.markerColor) || normalizeMarkerColor(existing?.markerColor)
    if (!markerColor || usedColors.has(markerColor)) {
      markerColor = generateUniqueMarkerColor(usedColors)
    }
    usedColors.add(markerColor)
    return { ...plainPlayer, marker, markerColor }
  })
}

const buildHostPlayerFromUser = (user, marker = 'X', markerColor = '') => {
  if (!user?._id) return null
  return {
    userId: String(user._id),
    name: user.name || user.username || 'Host',
    avatar: user.avatar || '',
    type: 'human',
    marker: normalizeMarker(marker) || 'X',
    markerColor: normalizeMarkerColor(markerColor) || generateUniqueMarkerColor(),
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
  marker: normalizeMarker(player.marker),
  markerColor: normalizeMarkerColor(player.markerColor),
})

const arePlayerListsEqual = (currentPlayers = [], nextPlayers = []) =>
  JSON.stringify(currentPlayers.map(normalizePlayerForCompare))
    === JSON.stringify(nextPlayers.map(normalizePlayerForCompare))

const normalizeChatMessage = (message = {}) => ({
  id: String(message.id || ''),
  senderId: String(message.senderId || ''),
  senderName: String(message.senderName || 'Player').trim() || 'Player',
  text: String(message.text || '').trim(),
  createdAt: message.createdAt || new Date(),
})

const getRoomChatMessages = (room) => (room?.chatMessages || [])
  .map(normalizeChatMessage)
  .filter((message) => message.id && message.text)

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

const getValidHumanUserIds = async (players = []) => {
  const userIds = [...new Set(players
    .filter((player) => player?.type !== 'ai')
    .map((player) => String(player?.userId || ''))
    .filter((userId) => userId && mongoose.Types.ObjectId.isValid(userId)))]

  if (!userIds.length) return new Set()

  const users = await User.find({ _id: { $in: userIds } })
    .select('_id')
    .lean()
    .catch(() => [])
  return new Set(users.map((user) => String(user._id)))
}

const normalizeRoomPlayers = async (room, hostPlayer) => {
  const currentPlayers = Array.isArray(room?.players) ? room.players : []
  const validHumanUserIds = await getValidHumanUserIds(currentPlayers)
  const hostUserId = room?.host ? String(room.host) : null
  const hostName = String(hostPlayer?.name || '').trim().toLowerCase()
  const seenHumanUserIds = new Set()
  const nextPlayers = []

  currentPlayers.forEach((player) => {
    if (!player) return
    if (player.type === 'ai') {
      nextPlayers.push(player)
      return
    }
    const playerUserId = String(player.userId || '')

    // Local "second player" on the same PC has a synthetic userId; pass through
    // as long as it's distinct from the host and not duplicated.
    if (playerUserId.startsWith('local_player_')) {
      if (playerUserId === hostUserId || seenHumanUserIds.has(playerUserId)) return
      seenHumanUserIds.add(playerUserId)
      nextPlayers.push(player)
      return
    }
    if (!playerUserId || !validHumanUserIds.has(playerUserId) || seenHumanUserIds.has(playerUserId)) return

    const playerName = String(player.name || '').trim().toLowerCase()
    if (hostUserId && playerUserId !== hostUserId && hostName && playerName === hostName) return

    seenHumanUserIds.add(playerUserId)
    nextPlayers.push(player)
  })

  const hasHostPlayer = Boolean(
    hostUserId && nextPlayers.some((player) => String(player?.userId) === hostUserId)
  )
  const hasHumanPlayer = nextPlayers.some((player) => player?.type !== 'ai')

  if (hostPlayer && !hasHostPlayer && !hasHumanPlayer) {
    nextPlayers.unshift(hostPlayer)
  }

  return nextPlayers.slice(0, room.size)
}

const resolveUserIdFromRequest = async ({ authenticatedUserId, userId, username, email } = {}) => {
  const authenticatedUser = await findUserByIdentity({ userId: authenticatedUserId })
  if (authenticatedUser) return String(authenticatedUser._id)
  const fallbackUser = await findUserByIdentity({ userId, username, email })
  if (fallbackUser) return String(fallbackUser._id)
  return authenticatedUserId || userId || null
}

module.exports = {
  DEFAULT_MARKER_BY_SIZE,
  MAX_CHAT_MESSAGE_LENGTH,
  generateUniqueRoomId,
  normalizeMarker,
  normalizeMarkerColor,
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
}
