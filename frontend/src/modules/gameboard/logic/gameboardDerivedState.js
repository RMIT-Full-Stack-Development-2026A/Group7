import { resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js'
import {
  buildLocalTurnPlayers,
  buildPlayersFromRoom,
  getExpandedBoardSize,
  normalizeBoardSize,
  normalizeBoardStyle,
} from './gameboardLogic.js'

export const getAiSymbol = (isAIGame, turnSelection) => {
  if (!isAIGame) {
    return null
  }

  if (turnSelection?.playerAssignments?.X?.type === 'ai') {
    return 'X'
  }

  if (turnSelection?.playerAssignments?.O?.type === 'ai') {
    return 'O'
  }

  return 'O'
}

export const getHumanSymbol = (isAIGame, aiSymbol) => {
  if (!isAIGame) {
    return null
  }

  return aiSymbol === 'X' ? 'O' : 'X'
}

const resolveViewerSymbolForPlayers = ({ players, authIdentity }) => {
  const viewerId = authIdentity?.userId || authIdentity?.id
  if (!viewerId) return null
  if (players?.X?.userId && String(players.X.userId) === String(viewerId)) return 'X'
  if (players?.O?.userId && String(players.O.userId) === String(viewerId)) return 'O'
  return null
}

export const getResolvedPlayers = ({
  roomData,
  isAIGame,
  aiDifficulty,
  turnSelection,
  authIdentity,
  humanSymbol,
}) => {
  const resolvedPlayers = buildPlayersFromRoom(roomData, isAIGame, aiDifficulty, turnSelection)

  if (!authIdentity?.avatar) {
    return resolvedPlayers
  }

  // For AI singleplayer games the viewer always controls the human slot.
  if (isAIGame) {
    if (humanSymbol && resolvedPlayers[humanSymbol]) {
      return {
        ...resolvedPlayers,
        [humanSymbol]: {
          ...resolvedPlayers[humanSymbol],
          avatar: resolvedPlayers[humanSymbol].avatar || resolveAvatarUrl(authIdentity.avatar, { fallbackToDefault: false }),
        },
      }
    }
    return resolvedPlayers
  }

  // Multiplayer / local: only fill the viewer's own slot from their auth identity.
  // Filling the wrong slot would make a remote viewer see their own avatar in
  // the opponent's seat (bug seen when two browsers share a device).
  const viewerSymbol = resolveViewerSymbolForPlayers({ players: resolvedPlayers, authIdentity })
  if (viewerSymbol && resolvedPlayers[viewerSymbol]) {
    return {
      ...resolvedPlayers,
      [viewerSymbol]: {
        ...resolvedPlayers[viewerSymbol],
        avatar: resolvedPlayers[viewerSymbol].avatar || resolveAvatarUrl(authIdentity.avatar, { fallbackToDefault: false }),
      },
    }
  }

  return resolvedPlayers
}

export const getLocalTurnState = ({ roomData, turnSelection, boardSize, isLocalOnlyGame }) => {
  const localTurnPlayers = buildLocalTurnPlayers(roomData, turnSelection)
  const isExpandedLocalGame = isLocalOnlyGame && localTurnPlayers.length > 2
  const normalizedBoardSize = getExpandedBoardSize(boardSize, isExpandedLocalGame ? localTurnPlayers.length : 2)
  const baseBoardSize = normalizeBoardSize(boardSize)
  const boardStyleVariant = normalizeBoardStyle(roomData?.gameSettings?.boardStyle)

  return {
    localTurnPlayers,
    isExpandedLocalGame,
    normalizedBoardSize,
    baseBoardSize,
    boardStyleVariant,
  }
}

export const getMarkerDisplayBySymbol = (players) => ({
  X: players.X.marker || 'X',
  O: players.O.marker || 'O',
})

export const getMarkerColorBySymbol = (players) => ({
  X: players.X.markerColor || '',
  O: players.O.markerColor || '',
})

export const getLocalMarkerDisplayByToken = (localTurnPlayers) => (
  localTurnPlayers.reduce((accumulator, player) => {
    accumulator[player.token] = player.marker
    return accumulator
  }, {})
)

export const getLocalMarkerColorByToken = (localTurnPlayers) => (
  localTurnPlayers.reduce((accumulator, player) => {
    accumulator[player.token] = player.markerColor || ''
    return accumulator
  }, {})
)

export const getLocalPlayerByToken = (localTurnPlayers) => (
  localTurnPlayers.reduce((accumulator, player) => {
    accumulator[player.token] = player
    return accumulator
  }, {})
)

export const getWinnerPresentation = ({
  resultTone,
  winner,
  isExpandedLocalGame,
  localPlayerByToken,
  players,
}) => {
  if (resultTone === 'draw' || winner === 'draw') {
    return { badge: 'DRAW', title: 'Draw Game', message: 'No moves left on the board.' }
  }

  if (resultTone === 'lose') {
    return { badge: 'LOSE', title: 'You Lose', message: 'Better luck in the next battle.' }
  }

  if (isExpandedLocalGame && winner && winner !== 'draw') {
    const winningPlayerName = localPlayerByToken[winner]?.name || 'Player'
    return { badge: 'WIN', title: `${winningPlayerName} Wins!`, message: 'Congratulations!' }
  }

  if (winner === 'X' || winner === 'O') {
    const winningPlayer = winner === 'X' ? players.X : players.O
    const winningPlayerName = winningPlayer.displayName || winningPlayer.name
    return { badge: 'WIN', title: `${winningPlayerName} Wins!`, message: 'Congratulations!' }
  }

  return { badge: 'DRAW', title: 'Draw Game', message: 'No moves left on the board.' }
}
