// Pure helpers that compute room/game flavor flags + viewer identity from raw inputs.

export const computeRoomFlags = ({ gameMode, opponentType, roomData }) => {
  const isAIGame = gameMode === 'singleplayer' && opponentType === 'ai'
  const roomPlayers = Array.isArray(roomData?.players) ? roomData.players : []
  const isRoomLocalGuestGame = roomPlayers.some(
    (player) => String(player?.userId || '').startsWith('local_player_'),
  )
  const isRoomMultiplayerGame = !isAIGame && Boolean(roomData?.roomId) && !isRoomLocalGuestGame
  const isLocalOnlyGame = gameMode === 'local' || !isAIGame

  let realHumanCount = 0
  for (const player of roomPlayers) {
    const id = String(player?.userId || '')
    const isAIPlayer = player?.type === 'ai' || id.startsWith('ai_')
    const isLocalPlaceholder = id.startsWith('local_player_')
    if (id && !isAIPlayer && !isLocalPlaceholder) realHumanCount += 1
  }
  const isOnlineGame = roomPlayers.length >= 2 && realHumanCount >= 2

  return { isAIGame, isRoomLocalGuestGame, isRoomMultiplayerGame, isLocalOnlyGame, isOnlineGame }
}

export const computeIsRoomHost = (authIdentity, roomData) => {
  const viewerId = authIdentity?.userId || authIdentity?.id
  return Boolean(viewerId && roomData?.host && String(viewerId) === String(roomData.host))
}

export const computeViewerSymbol = ({ isAIGame, humanSymbol, authIdentity, players }) => {
  if (isAIGame) return humanSymbol
  const viewerId = authIdentity?.userId || authIdentity?.id
  if (!viewerId) return null
  if (players.X?.userId && String(players.X.userId) === String(viewerId)) return 'X'
  if (players.O?.userId && String(players.O.userId) === String(viewerId)) return 'O'
  return null
}

export const computeViewerLocalToken = ({
  isExpandedLocalGame, authIdentity, localTurnPlayers, isRoomMultiplayerGame,
}) => {
  if (!isExpandedLocalGame) return null
  const viewerId = authIdentity?.userId || authIdentity?.id
  const viewerPlayer = localTurnPlayers.find(
    (player) => viewerId && String(player.id || player.userId) === String(viewerId),
  )
  if (isRoomMultiplayerGame) return viewerPlayer?.token || null
  return viewerPlayer?.token
    || localTurnPlayers.find((player) => player.type !== 'ai')?.token
    || localTurnPlayers[0]?.token
    || null
}

export const computeNormalizedTimeControl = (timeControl) => {
  const parsed = Number(timeControl)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60
}
