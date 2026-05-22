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
    playerClocksRef,
    previousPlayerRef,
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

        const recordedMoves = Array.isArray(localMovesRef?.current) ? localMovesRef.current : []
        const lastNonAIMove = [...recordedMoves]
          .reverse()
          .find((entry) => entry?.player !== currentLocalPlayer.token) || null

        const move = pickExpandedLocalAIMove({
          board: boardRef.current,
          currentLocalPlayer,
          localTurnPlayers,
          lastMove: lastNonAIMove ? { row: lastNonAIMove.row, col: lastNonAIMove.col } : null,
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
  }, [aiDifficulty, applyLocalMove, boardRef, currentLocalPlayer, currentPlayerRef, gameOver, gameOverRef, isExpandedLocalGame, isMakingMoveRef, localMovesRef, localTurnPlayers, normalizedTimeControl, onExpandedLocalAIMove, setMoveMakingState, shouldRunExpandedLocalAI])

  // Chess-clock turn-change handler: deduct the time the previous player just
  // spent from THEIR bank, then start ticking the new player's bank.
  useEffect(() => {
    if (!playerClocksRef || !previousPlayerRef) return

    // Lazy-init the bank for any token we haven't seen yet (covers the very
    // first effect run before resetMatchState has populated playerClocksRef).
    if (typeof playerClocksRef.current[currentPlayer] !== 'number') {
      playerClocksRef.current[currentPlayer] = normalizedTimeControl
    }

    const previousPlayer = previousPlayerRef.current
    const now = Date.now()
    if (previousPlayer && previousPlayer !== currentPlayer && turnStartedAtRef.current) {
      const elapsedSeconds = Math.max(0, (now - turnStartedAtRef.current) / 1000)
      const previousBank = playerClocksRef.current[previousPlayer] ?? normalizedTimeControl
      playerClocksRef.current[previousPlayer] = Math.max(0, previousBank - elapsedSeconds)
    }

    previousPlayerRef.current = currentPlayer
    turnStartedAtRef.current = now
    timeoutHandledForTurnRef.current = null
    setSecondsLeft(Math.ceil(playerClocksRef.current[currentPlayer] ?? normalizedTimeControl))
  }, [currentPlayer, normalizedTimeControl, playerClocksRef, previousPlayerRef, setSecondsLeft, timeoutHandledForTurnRef, turnStartedAtRef])

  useEffect(() => {
    if (gameOver) return undefined
    const timer = window.setInterval(() => {
      const banked = playerClocksRef?.current?.[currentPlayer] ?? normalizedTimeControl
      const elapsedSeconds = Math.max(0, (Date.now() - (turnStartedAtRef.current || Date.now())) / 1000)
      const remaining = Math.max(0, Math.ceil(banked - elapsedSeconds))
      setSecondsLeft(remaining)
    }, 250)
    return () => window.clearInterval(timer)
  }, [currentPlayer, gameOver, normalizedTimeControl, playerClocksRef, setSecondsLeft, turnStartedAtRef])

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
