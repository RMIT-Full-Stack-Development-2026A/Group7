import { useMemo, useState } from 'react'
import { getEmptyTiles } from '../../../shared/utils/game.utils.js'
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js'
import {
  getLocalMarkerDisplayByToken,
  getLocalMarkerColorByToken,
  getLocalPlayerByToken,
  getMarkerColorBySymbol,
  getLocalTurnState,
  getMarkerDisplayBySymbol,
  getResolvedPlayers,
  getWinnerPresentation,
  getAiSymbol,
  getHumanSymbol,
} from '../logic/gameboardDerivedState.js'
import { createEmptyBoard } from '../logic/gameboardMoveHelpers.js'
import { AI_DELAY_BY_DIFFICULTY_MS } from '../logic/gameboardLogic.js'
import {
  computeRoomFlags,
  computeIsRoomHost,
  computeViewerSymbol,
  computeViewerLocalToken,
  computeNormalizedTimeControl,
} from '../logic/gameboardRoomDerived.js'
import { useGameBoardEffects } from './useGameBoardEffects.js'
import { useGameBoardState } from './useGameBoardState.js'
import { useGameBoardActions } from './useGameBoardActions.js'

export function useGameBoard({
  boardSize,
  gameMode = 'singleplayer',
  opponentType = 'ai',
  aiDifficulty = 'medium',
  timeControl = 60,
  onGameEnd,
  roomData = null,
  turnSelection = null,
}) {
  const [authIdentity, setAuthIdentity] = useState(() => getStoredAuthIdentity())

  const { isAIGame, isRoomMultiplayerGame, isLocalOnlyGame, isOnlineGame } = useMemo(
    () => computeRoomFlags({ gameMode, opponentType, roomData }),
    [gameMode, opponentType, roomData],
  )

  const { localTurnPlayers, isExpandedLocalGame, normalizedBoardSize, baseBoardSize, boardStyleVariant } = useMemo(
    () => getLocalTurnState({ roomData, turnSelection, boardSize, isLocalOnlyGame }),
    [boardSize, isLocalOnlyGame, roomData, turnSelection],
  )
  const aiSymbol = useMemo(() => getAiSymbol(isAIGame, turnSelection), [isAIGame, turnSelection])
  const humanSymbol = useMemo(() => getHumanSymbol(isAIGame, aiSymbol), [aiSymbol, isAIGame])
  const players = useMemo(
    () => getResolvedPlayers({ roomData, isAIGame, aiDifficulty, turnSelection, authIdentity, humanSymbol }),
    [aiDifficulty, authIdentity, humanSymbol, isAIGame, roomData, turnSelection],
  )
  const isRoomHost = useMemo(() => computeIsRoomHost(authIdentity, roomData), [authIdentity, roomData])
  const markerDisplayBySymbol = useMemo(() => getMarkerDisplayBySymbol(players), [players])
  const markerColorBySymbol = useMemo(() => getMarkerColorBySymbol(players), [players])
  const localMarkerDisplayByToken = useMemo(() => getLocalMarkerDisplayByToken(localTurnPlayers), [localTurnPlayers])
  const localMarkerColorByToken = useMemo(() => getLocalMarkerColorByToken(localTurnPlayers), [localTurnPlayers])
  const localPlayerByToken = useMemo(() => getLocalPlayerByToken(localTurnPlayers), [localTurnPlayers])
  const emptyBoard = useMemo(() => createEmptyBoard(normalizedBoardSize), [normalizedBoardSize])
  const normalizedTimeControl = useMemo(() => computeNormalizedTimeControl(timeControl), [timeControl])
  const { refs, state, setters } = useGameBoardState(emptyBoard, normalizedTimeControl)
  const aiResponseDelayMs = useMemo(() => {
    const desiredDelay = AI_DELAY_BY_DIFFICULTY_MS[aiDifficulty] || AI_DELAY_BY_DIFFICULTY_MS.medium
    return Math.min(desiredDelay, normalizedTimeControl * 1000)
  }, [aiDifficulty, normalizedTimeControl])
  const viewerSymbol = useMemo(
    () => computeViewerSymbol({ isAIGame, humanSymbol, authIdentity, players }),
    [authIdentity, humanSymbol, isAIGame, players],
  )
  const currentLocalPlayer = useMemo(
    () => (isExpandedLocalGame ? localPlayerByToken[state.currentPlayer] || localTurnPlayers[0] || null : null),
    [state.currentPlayer, isExpandedLocalGame, localPlayerByToken, localTurnPlayers],
  )
  const viewerLocalToken = useMemo(
    () => computeViewerLocalToken({ isExpandedLocalGame, authIdentity, localTurnPlayers, isRoomMultiplayerGame }),
    [authIdentity, isExpandedLocalGame, isRoomMultiplayerGame, localTurnPlayers],
  )
  const playerOrder = useMemo(() => (isExpandedLocalGame ? localTurnPlayers : []), [isExpandedLocalGame, localTurnPlayers])
  const winnerPresentation = useMemo(
    () => getWinnerPresentation({ resultTone: state.resultTone, winner: state.winner, isExpandedLocalGame, localPlayerByToken, players }),
    [isExpandedLocalGame, localPlayerByToken, players, state.resultTone, state.winner],
  )

  const actions = useGameBoardActions({
    authIdentity, emptyBoard, humanSymbol, isAIGame, isExpandedLocalGame, isRoomMultiplayerGame,
    localTurnPlayers, normalizedTimeControl, onGameEnd, refs, roomData, setters, state,
    viewerLocalToken, viewerSymbol, currentLocalPlayer,
  })

  useGameBoardEffects({
    aiDifficulty,
    aiResponseDelayMs,
    aiSymbol,
    applyLocalMove: actions.applyLocalMove,
    applyRemoteMoveResult: actions.applyRemoteMoveResult,
    authIdentity,
    board: state.board,
    currentLocalPlayer,
    currentPlayer: state.currentPlayer,
    gameId: state.gameId,
    gameMode,
    gameOver: state.gameOver,
    humanSymbol,
    isAIGame,
    isExpandedLocalGame,
    isLocalOnlyGame,
    localTurnPlayers,
    normalizedBoardSize,
    normalizedTimeControl,
    onAuthIdentity: setAuthIdentity,
    onExpandedLocalAIMove: actions.emitRoomMove,
    opponentType,
    players,
    refs,
    resetMatchState: actions.resetCurrentMatchState,
    roomData,
    shouldRunExpandedLocalAI: !isRoomMultiplayerGame || isRoomHost,
    setters: { ...setters, onTimeUp: actions.skipCurrentTurn, secondsLeft: state.secondsLeft },
    timeControl,
    winner: state.winner,
    winningTiles: state.winningTiles,
  })

  return {
    board: state.board,
    baseBoardSize,
    boardStyleVariant,
    closeSettingsMenu: actions.closeSettingsMenu,
    currentPlayer: state.currentPlayer,
    currentLocalPlayer,
    gameOver: state.gameOver,
    handleAbort: actions.handleAbort,
    handleGiveUp: actions.handleGiveUp,
    handleTileClick: actions.handleTileClick,
    isOnlineGame,
    humanSymbol,
    isExpandedLocalGame,
    isAIGame,
    isMovePending: state.isMovePending,
    lastMove: state.lastMove,
    localMarkerDisplayByToken,
    localMarkerColorByToken,
    localPlayerByToken,
    markerColorBySymbol,
    markerDisplayBySymbol,
    normalizedBoardSize,
    openSettingsMenu: actions.openSettingsMenu,
    openTileCount: getEmptyTiles(state.board).length,
    playerOrder,
    players,
    returnToMainMenu: actions.returnToMainMenu,
    secondsLeft: state.secondsLeft,
    setShowGiveUpConfirm: setters.setShowGiveUpConfirm,
    showGiveUpConfirm: state.showGiveUpConfirm,
    showPopup: state.showPopup,
    showSettingsMenu: state.showSettingsMenu,
    showWinAnimation: state.showWinAnimation,
    winnerPresentation,
    winningTiles: state.winningTiles,
  }
}

export default useGameBoard
