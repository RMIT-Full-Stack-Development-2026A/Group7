import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../../../router/routes.config.js'
import { getEmptyTiles, getWinningTiles } from '../../../shared/utils/game.utils.js'
import { gameAPI } from '../../../config/api/game.api.js'
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js'
import {
  getLocalMarkerDisplayByToken,
  getLocalPlayerByToken,
  getLocalTurnState,
  getMarkerDisplayBySymbol,
  getResolvedPlayers,
  getWinnerPresentation,
  getAiSymbol,
  getHumanSymbol,
} from '../logic/gameboardDerivedState.js'
import {
  completeMove,
  createEmptyBoard,
  getNextLocalPlayerToken,
  resolveResultTone,
} from '../logic/gameboardMoveHelpers.js'
import {
  applyRemoteMoveResult as applyRemoteMoveResultTransition,
  resetMatchState,
} from '../logic/gameboardStateTransitions.js'
import { AI_DELAY_BY_DIFFICULTY_MS, REMOTE_MOVE_TIMEOUT_MS } from '../logic/gameboardLogic.js'
import { useGameBoardEffects } from './useGameBoardEffects.js'
import { useGameBoardState } from './useGameBoardState.js'

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
  const navigate = useNavigate()
  const [authIdentity, setAuthIdentity] = useState(() => getStoredAuthIdentity())
  const isAIGame = gameMode === 'singleplayer' && opponentType === 'ai'
  const isLocalOnlyGame = gameMode === 'local' || !isAIGame
  const { localTurnPlayers, isExpandedLocalGame, normalizedBoardSize, baseBoardSize, boardStyleVariant } = useMemo(
    () => getLocalTurnState({ roomData, turnSelection, boardSize, isLocalOnlyGame }),
    [boardSize, isLocalOnlyGame, roomData, turnSelection]
  )
  const aiSymbol = useMemo(() => getAiSymbol(isAIGame, turnSelection), [isAIGame, turnSelection])
  const humanSymbol = useMemo(() => getHumanSymbol(isAIGame, aiSymbol), [aiSymbol, isAIGame])
  const players = useMemo(
    () => getResolvedPlayers({ roomData, isAIGame, aiDifficulty, turnSelection, authIdentity, humanSymbol }),
    [aiDifficulty, authIdentity, humanSymbol, isAIGame, roomData, turnSelection]
  )
  const markerDisplayBySymbol = useMemo(() => getMarkerDisplayBySymbol(players), [players])
  const localMarkerDisplayByToken = useMemo(() => getLocalMarkerDisplayByToken(localTurnPlayers), [localTurnPlayers])
  const localPlayerByToken = useMemo(() => getLocalPlayerByToken(localTurnPlayers), [localTurnPlayers])
  const emptyBoard = useMemo(() => createEmptyBoard(normalizedBoardSize), [normalizedBoardSize])
  const normalizedTimeControl = useMemo(() => {
    const parsed = Number(timeControl)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60
  }, [timeControl])
  const { refs, state, setters } = useGameBoardState(emptyBoard, normalizedTimeControl)
  const aiResponseDelayMs = useMemo(() => {
    const desiredDelay = AI_DELAY_BY_DIFFICULTY_MS[aiDifficulty] || AI_DELAY_BY_DIFFICULTY_MS.medium
    return Math.min(desiredDelay, normalizedTimeControl * 1000)
  }, [aiDifficulty, normalizedTimeControl])
  const viewerSymbol = useMemo(() => (isAIGame ? humanSymbol : null), [humanSymbol, isAIGame])
  const currentLocalPlayer = useMemo(
    () => (isExpandedLocalGame ? localPlayerByToken[state.currentPlayer] || localTurnPlayers[0] || null : null),
    [state.currentPlayer, isExpandedLocalGame, localPlayerByToken, localTurnPlayers]
  )
  const viewerLocalToken = useMemo(() => {
    if (!isExpandedLocalGame) {
      return null
    }

    const viewerId = authIdentity?.userId || authIdentity?.id
    const viewerPlayer = localTurnPlayers.find((player) => (
      viewerId && String(player.id || player.userId) === String(viewerId)
    ))

    return viewerPlayer?.token || localTurnPlayers.find((player) => player.type !== 'ai')?.token || localTurnPlayers[0]?.token || null
  }, [authIdentity?.id, authIdentity?.userId, isExpandedLocalGame, localTurnPlayers])
  const playerOrder = useMemo(() => (isExpandedLocalGame ? localTurnPlayers : []), [isExpandedLocalGame, localTurnPlayers])
  const winnerPresentation = useMemo(
    () => getWinnerPresentation({ resultTone: state.resultTone, winner: state.winner, isExpandedLocalGame, localPlayerByToken, players }),
    [isExpandedLocalGame, localPlayerByToken, players, state.resultTone, state.winner]
  )

  const resolveResultToneFromSymbol = useCallback(
    (winningSymbol) => (
      isExpandedLocalGame
        ? resolveResultTone(winningSymbol, viewerLocalToken)
        : resolveResultTone(winningSymbol, viewerSymbol)
    ),
    [isExpandedLocalGame, viewerLocalToken, viewerSymbol]
  )
  const applyRemoteMoveResult = useCallback((moveResult) => applyRemoteMoveResultTransition({
    moveResult,
    setters,
    resolveResultToneFromSymbol,
    getWinningTiles,
  }), [resolveResultToneFromSymbol, setters])

  const applyLocalMove = useCallback((row, col, player) => {
    const activeBoard = refs.boardRef.current?.length ? refs.boardRef.current : state.board
    if (!activeBoard[row] || activeBoard[row][col] !== null) {
      return false
    }

    refs.hasLocalProgressRef.current = true
    const nextBoard = activeBoard.map((boardRow) => [...boardRow])
    nextBoard[row][col] = player
    completeMove({
      nextBoard,
      row,
      col,
      player,
      boardRef: refs.boardRef,
      isExpandedLocalGame,
      localTurnPlayers,
      resolveResultToneFromSymbol,
      setWinningTiles: setters.setWinningTiles,
      setWinner: setters.setWinner,
      setResultTone: setters.setResultTone,
      setShowWinAnimation: setters.setShowWinAnimation,
      setBoard: setters.setBoard,
      setLastMove: setters.setLastMove,
      setGameOver: setters.setGameOver,
      setShowPopup: setters.setShowPopup,
      setCurrentPlayer: setters.setCurrentPlayer,
    })
    return true
  }, [isExpandedLocalGame, localTurnPlayers, refs.boardRef, refs.hasLocalProgressRef, resolveResultToneFromSymbol, setters, state.board])

  const skipCurrentTurn = useCallback(() => {
    if (state.gameOver) {
      return
    }

    setters.setCurrentPlayer((player) => (
      isExpandedLocalGame ? getNextLocalPlayerToken(player, isExpandedLocalGame, localTurnPlayers) : (player === 'X' ? 'O' : 'X')
    ))
  }, [isExpandedLocalGame, localTurnPlayers, setters, state.gameOver])

  const resetCurrentMatchState = useCallback(() => resetMatchState({
    refs,
    setters,
    emptyBoard,
    isExpandedLocalGame,
    localTurnPlayers,
    normalizedTimeControl,
  }), [emptyBoard, isExpandedLocalGame, localTurnPlayers, normalizedTimeControl, refs, setters])

  useGameBoardEffects({
    aiDifficulty,
    aiResponseDelayMs,
    aiSymbol,
    applyLocalMove,
    applyRemoteMoveResult,
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
    opponentType,
    players,
    refs,
    resetMatchState: resetCurrentMatchState,
    roomData,
    setters: {
      ...setters,
      onTimeUp: skipCurrentTurn,
      secondsLeft: state.secondsLeft,
    },
    timeControl,
    winner: state.winner,
    winningTiles: state.winningTiles,
  })

  const openSettingsMenu = () => { setters.setShowGiveUpConfirm(false); setters.setShowSettingsMenu(true) }
  const closeSettingsMenu = () => { setters.setShowGiveUpConfirm(false); setters.setShowSettingsMenu(false) }

  const handleGiveUp = async () => {
    const opponentSymbol = isExpandedLocalGame
      ? getNextLocalPlayerToken(state.currentPlayer, isExpandedLocalGame, localTurnPlayers)
      : (viewerSymbol ? (viewerSymbol === 'X' ? 'O' : 'X') : (state.currentPlayer === 'X' ? 'O' : 'X'))

    setters.setShowGiveUpConfirm(false)
    setters.setShowSettingsMenu(false)

    if (state.useRemoteSession && state.gameId) {
      try {
        await gameAPI.resignGame(state.gameId)
      } catch (error) {
        console.error('Failed to resign backend game:', error)
      }
    }

    setters.setGameOver(true)
    setters.setWinningTiles([])
    setters.setShowWinAnimation(false)
    setters.setWinner(opponentSymbol)
    setters.setResultTone('lose')
    setters.setShowPopup(true)
  }

  const handleTileClick = async (row, col) => {
    if (refs.isMakingMoveRef.current || state.gameOver || (isAIGame && state.currentPlayer !== humanSymbol) || state.board[row]?.[col]) {
      return
    }

    setters.setMoveMakingState(true)
    const elapsedSeconds = Math.max(0, normalizedTimeControl - state.secondsLeft)

    try {
      if (state.useRemoteSession && state.gameId) {
        const response = await gameAPI.makeMove(state.gameId, { row, col, timeTaken: elapsedSeconds }, REMOTE_MOVE_TIMEOUT_MS)
        if (!response.ok) {
          throw new Error(response.data?.message || response.data?.error || 'Move failed')
        }

        applyRemoteMoveResult(response.data.data)
        return
      }

      applyLocalMove(row, col, state.currentPlayer)
    } catch (error) {
      if (!isAIGame) {
        applyLocalMove(row, col, state.currentPlayer)
      } else {
        console.error('Failed to submit move to backend:', error)
      }
    } finally {
      setters.setMoveMakingState(false)
    }
  }

  const returnToMainMenu = () => {
    setters.setShowPopup(false)
    if (onGameEnd) {
      onGameEnd(state.winner)
    }
    navigate(ROUTES.MAIN_MENU)
  }

  return {
    board: state.board,
    baseBoardSize,
    boardStyleVariant,
    closeSettingsMenu,
    currentPlayer: state.currentPlayer,
    currentLocalPlayer,
    gameOver: state.gameOver,
    handleGiveUp,
    handleTileClick,
    humanSymbol,
    isExpandedLocalGame,
    isAIGame,
    isMovePending: state.isMovePending,
    lastMove: state.lastMove,
    localMarkerDisplayByToken,
    localPlayerByToken,
    markerDisplayBySymbol,
    normalizedBoardSize,
    openSettingsMenu,
    openTileCount: getEmptyTiles(state.board).length,
    playerOrder,
    players,
    returnToMainMenu,
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
