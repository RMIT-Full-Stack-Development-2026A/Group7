import { useEffect } from 'react'
import { gameAPI } from '../../../config/api/game.api.js'
import { gameroomService } from '../../gameroom/services/gameroomService.js'
import { buildRemoteParticipantPayloads } from '../logic/gameboardLogic.js'
import {
  getLocalAIDelayMs,
  pickExpandedLocalAIMove,
} from '../logic/gameboardMoveHelpers.js'

export const useGameBoardLocalEffects = ({
  aiDifficulty,
  applyLocalMove,
  board,
  currentLocalPlayer,
  currentPlayer,
  gameOver,
  isExpandedLocalGame,
  isLocalOnlyGame,
  localTurnPlayers,
  normalizedBoardSize,
  normalizedTimeControl,
  onExpandedLocalAIMove,
  players,
  refs,
  roomData,
  shouldRunExpandedLocalAI = true,
  setters,
  winner,
  winningTiles,
}) => {
  const {
    boardRef,
    currentPlayerRef,
    gameOverRef,
    isMakingMoveRef,
    localHistorySavedRef,
    localMovesRef,
    matchStartedAtRef,
    roomCleanupDoneRef,
    timeoutHandledForTurnRef,
    turnStartedAtRef,
  } = refs
  const {
    setMoveMakingState,
    setSecondsLeft,
    setShowGiveUpConfirm,
    setShowSettingsMenu,
    secondsLeft,
    onTimeUp,
  } = setters

  useEffect(() => { currentPlayerRef.current = currentPlayer }, [currentPlayer, currentPlayerRef])
  useEffect(() => { boardRef.current = board }, [board, boardRef])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver, gameOverRef])

  useEffect(() => {
    if (!isExpandedLocalGame || !shouldRunExpandedLocalAI || gameOver
      || isMakingMoveRef.current || currentLocalPlayer?.type !== 'ai') return undefined

    let isCancelled = false

    const makeExpandedLocalAIMove = async () => {
      setMoveMakingState(true)
      try {
        await new Promise((resolve) => window.setTimeout(
          resolve,
          getLocalAIDelayMs(currentLocalPlayer.aiDifficulty || aiDifficulty, normalizedTimeControl)
        ))
        if (isCancelled || gameOverRef.current
          || currentPlayerRef.current !== currentLocalPlayer.token) return

        const move = pickExpandedLocalAIMove({
          board: boardRef.current, currentLocalPlayer, localTurnPlayers,
        })

        if (move) {
          const didApplyMove = applyLocalMove(move.row, move.col, currentLocalPlayer.token)
          if (didApplyMove) {
            onExpandedLocalAIMove?.(move.row, move.col, currentLocalPlayer.token)
          }
        }
      } finally {
        if (!isCancelled) setMoveMakingState(false)
      }
    }

    makeExpandedLocalAIMove()
    return () => { isCancelled = true }
  }, [aiDifficulty, applyLocalMove, boardRef, currentLocalPlayer, currentPlayerRef, gameOver, gameOverRef, isExpandedLocalGame, isMakingMoveRef, localTurnPlayers, normalizedTimeControl, onExpandedLocalAIMove, setMoveMakingState, shouldRunExpandedLocalAI])

  useEffect(() => {
    turnStartedAtRef.current = Date.now()
    setSecondsLeft(normalizedTimeControl)
    timeoutHandledForTurnRef.current = null
  }, [currentPlayer, normalizedTimeControl, setSecondsLeft, timeoutHandledForTurnRef, turnStartedAtRef])

  useEffect(() => {
    if (gameOver) return undefined
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - turnStartedAtRef.current) / 1000)
      setSecondsLeft(Math.max(normalizedTimeControl - elapsedSeconds, 0))
    }, 250)
    return () => window.clearInterval(timer)
  }, [currentPlayer, gameOver, normalizedTimeControl, setSecondsLeft, turnStartedAtRef])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSettingsMenu((current) => {
          const next = !current
          if (!next) setShowGiveUpConfirm(false)
          return next
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowGiveUpConfirm, setShowSettingsMenu])

  useEffect(() => {
    if (gameOver || secondsLeft > 0 || timeoutHandledForTurnRef.current === currentPlayer) return
    timeoutHandledForTurnRef.current = currentPlayer
    if (!isMakingMoveRef.current) onTimeUp()
  }, [currentPlayer, gameOver, isMakingMoveRef, onTimeUp, secondsLeft, timeoutHandledForTurnRef])

  useEffect(() => {
    const shouldSaveLocalHistory = isLocalOnlyGame && (!roomData?.roomId || shouldRunExpandedLocalAI)
    if (!shouldSaveLocalHistory || !gameOver || !winner || localHistorySavedRef.current) return undefined

    localHistorySavedRef.current = true

    const participants = buildRemoteParticipantPayloads({ localTurnPlayers, players })
    const totalMoves = board.reduce(
      (count, boardRow) => count + boardRow.filter((cell) => cell !== null).length, 0
    )
    const recordedMoves = Array.isArray(localMovesRef?.current) ? localMovesRef.current : []

    gameAPI.saveLocalHistory({
      boardSize: normalizedBoardSize,
      timeControl: normalizedTimeControl,
      participants,
      winner: winner || 'draw',
      winningTiles,
      totalMoves: recordedMoves.length > 0 ? recordedMoves.length : totalMoves,
      startedAt: matchStartedAtRef.current,
      moves: recordedMoves,
    }).then((response) => {
      if (!response?.ok) {
        localHistorySavedRef.current = false
        console.error('Failed to save local game history:', response?.data?.message || response?.data?.error || 'Unknown error')
      }
    }).catch((error) => {
      localHistorySavedRef.current = false
      console.error('Failed to save local game history:', error)
    })

    return undefined
  }, [board, gameOver, isLocalOnlyGame, localHistorySavedRef, localMovesRef, localTurnPlayers, matchStartedAtRef, normalizedBoardSize, normalizedTimeControl, players, roomData?.roomId, shouldRunExpandedLocalAI, winner, winningTiles])

  useEffect(() => {
    if (!gameOver || !roomData?._id || roomCleanupDoneRef.current) return undefined
    roomCleanupDoneRef.current = true
    gameroomService.deleteRoom(roomData._id).catch((error) => {
      roomCleanupDoneRef.current = false
      console.error('Failed to delete finished room:', error)
    })
    return undefined
  }, [gameOver, roomData, roomCleanupDoneRef])
}
