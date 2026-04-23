import { getMarkerLabelsBySymbol, getMarkerSymbols } from '../../../shared/utils/marker.utils.js'
import { AI_AVATAR, resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js'

export const DEFAULT_PLAYERS = {
  X: {
    name: 'Player 1',
    avatar: '',
  },
  O: {
    name: 'Player 2',
    avatar: '',
  },
}

export const REMOTE_INIT_TIMEOUT_MS = 2500
export const REMOTE_MOVE_TIMEOUT_MS = 4000
export const AI_DELAY_BY_DIFFICULTY_MS = {
  easy: 1000,
  medium: 2000,
  hard: 3000,
}

export const normalizeBoardStyle = (boardStyle) => {
  const normalizedStyle = String(boardStyle || 'Classic').trim().toLowerCase()

  if (normalizedStyle === 'modern') {
    return 'modern'
  }

  if (normalizedStyle === 'minimal') {
    return 'minimal'
  }

  return 'classic'
}

export const normalizeBoardSize = (boardSize) => {
  if (typeof boardSize === 'number') {
    return boardSize === 15 ? 15 : 10
  }

  const matchedBoardSize = String(boardSize || '10').match(/(?:^|\D)(10|15)(?=\D|$)/)
  const parsedBoardSize = matchedBoardSize ? Number(matchedBoardSize[1]) : 10

  return parsedBoardSize === 15 ? 15 : 10
}

export const getExpandedBoardSize = (boardSize) => {
  return normalizeBoardSize(boardSize)
}

export const buildPlayersFromRoom = (roomData, isAIGame, aiDifficulty, turnSelection) => {
  const turnAssignments = turnSelection?.playerAssignments

  if (turnAssignments?.X && turnAssignments?.O) {
    return {
      X: {
        userId: turnAssignments.X.userId || null,
        name: turnAssignments.X.name || DEFAULT_PLAYERS.X.name,
        avatar: resolveAvatarUrl(turnAssignments.X.avatar, { isAI: turnAssignments.X.type === 'ai', fallbackToDefault: false }),
        marker: turnAssignments.X.marker || 'X',
      },
      O: {
        userId: turnAssignments.O.userId || null,
        name: turnAssignments.O.name || (isAIGame ? `AI (${aiDifficulty})` : DEFAULT_PLAYERS.O.name),
        avatar: resolveAvatarUrl(turnAssignments.O.avatar, { isAI: turnAssignments.O.type === 'ai', fallbackToDefault: false }),
        marker: turnAssignments.O.marker || 'O',
      },
    }
  }

  const roomPlayers = Array.isArray(roomData?.players) ? roomData.players : []
  const markerLabels = getMarkerLabelsBySymbol(roomData?.gameSettings?.marker)
  const firstPlayer = roomPlayers[0]
  const secondPlayer = roomPlayers[1]

  return {
    X: {
      userId: firstPlayer?.userId || firstPlayer?._id || null,
      name: firstPlayer?.name || DEFAULT_PLAYERS.X.name,
      avatar: resolveAvatarUrl(firstPlayer?.avatar || firstPlayer?.avatarUrl, { isAI: firstPlayer?.type === 'ai', fallbackToDefault: false }),
      marker: markerLabels.X,
    },
    O: {
      userId: secondPlayer?.userId || secondPlayer?._id || null,
      name: secondPlayer?.name || (isAIGame ? `AI (${aiDifficulty})` : DEFAULT_PLAYERS.O.name),
      avatar: resolveAvatarUrl(secondPlayer?.avatar || secondPlayer?.avatarUrl, { isAI: secondPlayer?.type === 'ai', fallbackToDefault: false }),
      marker: markerLabels.O,
    },
  }
}

export const buildLocalTurnPlayers = (roomData, turnSelection) => {
  const turnPlayers = Array.isArray(turnSelection?.turns) ? turnSelection.turns : []

  if (turnPlayers.length > 0) {
    return turnPlayers.map((turn, index) => ({
      id: turn.userId || `local_player_${index + 1}`,
      token: `P${index + 1}`,
      name: turn.name || `Player ${index + 1}`,
      avatar: resolveAvatarUrl(turn.avatar, { isAI: turn.type === 'ai', fallbackToDefault: false }),
      marker: turn.marker || `Marker ${index + 1}`,
      type: turn.type || 'human',
      order: turn.order || index + 1,
    }))
  }

  const roomPlayers = Array.isArray(roomData?.players) ? roomData.players : []
  const markers = getMarkerSymbols(roomData?.gameSettings?.marker, roomPlayers.length || 2)

  return roomPlayers.map((player, index) => ({
    id: player?.userId || player?._id || `local_player_${index + 1}`,
    token: `P${index + 1}`,
    name: player?.name || `Player ${index + 1}`,
    avatar: resolveAvatarUrl(player?.avatar || player?.avatarUrl, { isAI: player?.type === 'ai', fallbackToDefault: false }),
    marker: markers[index] || `Marker ${index + 1}`,
    type: player?.type || 'human',
    order: index + 1,
  }))
}

export const buildRemotePlayerPayloads = ({ roomData, players, aiSymbol, humanSymbol, aiDifficulty, authIdentity }) => {
  const roomPlayers = Array.isArray(roomData?.players) ? roomData.players : []
  const firstHuman = roomPlayers.find((player) => player?.type !== 'ai') || roomPlayers[0] || null
  const secondHuman = roomPlayers.find((player, index) => player?.type !== 'ai' && index !== roomPlayers.indexOf(firstHuman)) || roomPlayers[1] || null

  const aiPayload = (symbol) => ({
    playerId: `ai_${symbol}_${Date.now()}`,
    playerName: players[symbol].name,
    avatar: players[symbol]?.avatar || AI_AVATAR,
    playerRank: aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'hard' ? 1400 : 1200,
    isAI: true,
    aiDifficulty,
  })

  const humanSourceFor = (symbol) => {
    if (humanSymbol === symbol) {
      return firstHuman
    }
    return secondHuman || firstHuman
  }

  const humanPayload = (symbol) => {
    const source = humanSourceFor(symbol)
    const isViewerSymbol = symbol === humanSymbol

    return {
      playerId: (isViewerSymbol ? (authIdentity?.userId || authIdentity?.id) : null) || players[symbol]?.userId || source?.userId || source?._id || `player_${symbol}_${Date.now()}`,
      playerName: players[symbol].name,
      avatar: (isViewerSymbol ? authIdentity?.avatar : '') || players[symbol]?.avatar || source?.avatar || source?.avatarUrl || '',
      playerRank: 1200,
      isAI: false,
      aiDifficulty: null,
    }
  }

  return {
    X: aiSymbol === 'X' ? aiPayload('X') : humanPayload('X'),
    O: aiSymbol === 'O' ? aiPayload('O') : humanPayload('O'),
  }
}

export const buildRemoteParticipantPayloads = ({ localTurnPlayers, players }) => {
  if (Array.isArray(localTurnPlayers) && localTurnPlayers.length > 0) {
    return localTurnPlayers.map((player, index) => ({
      playerId: player.id || player.userId || `participant_${index + 1}`,
      playerName: player.name || `Player ${index + 1}`,
      avatar: player.avatar || '',
      playerSymbol: player.token || `P${index + 1}`,
      marker: player.marker || player.token || `P${index + 1}`,
      order: player.order || index + 1,
      isAI: player.type === 'ai',
      aiDifficulty: player.aiDifficulty || null,
    }))
  }

  return ['X', 'O'].map((symbol, index) => ({
    playerId: players[symbol]?.userId || `participant_${symbol}`,
    playerName: players[symbol]?.name || `Player ${index + 1}`,
    avatar: players[symbol]?.avatar || '',
    playerSymbol: symbol,
    marker: players[symbol]?.marker || symbol,
    order: index + 1,
    isAI: false,
    aiDifficulty: null,
  }))
}
