import { useEffect } from 'react'
import { gameAPI } from '../../../config/api/game.api.js'
import { gameroomService } from '../../gameroom/services/gameroomService.js'
import { resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js'
import {
  buildRemoteParticipantPayloads,
  buildRemotePlayerPayloads,
  REMOTE_INIT_TIMEOUT_MS,
  REMOTE_MOVE_TIMEOUT_MS,
} from '../logic/gameboardLogic.js'
import {
  getLocalAIDelayMs,
  pickExpandedLocalAIMove,
} from '../logic/gameboardMoveHelpers.js'

export const useGameBoardEffects = ({
  aiDifficulty,
  aiResponseDelayMs,
  aiSymbol,
  applyLocalMove,
  applyRemoteMoveResult,
  authIdentity,
  board,
  currentLocalPlayer,
  currentPlayer,
  gameId,
  gameMode,
  gameOver,
  humanSymbol,
  isAIGame,
  isExpandedLocalGame,
  isLocalOnlyGame,
  localTurnPlayers,
  normalizedBoardSize,
  normalizedTimeControl,
  onAuthIdentity,
  opponentType,
  players,
  refs,
  resetMatchState,
  roomData,
  setters,
  timeControl,
  winner,
  winningTiles,
}) => {
  const {
    boardRef,
    currentPlayerRef,
    gameOverRef,
    hasLocalProgressRef,
    isMakingMoveRef,
    localHistorySavedRef,
    matchStartedAtRef,
    roomCleanupDoneRef,
    timeoutHandledForTurnRef,
    turnStartedAtRef,
  } = refs
  const {
    setCurrentPlayer,
    setGameId,
    setMoveMakingState,
    setSecondsLeft,
    setShowGiveUpConfirm,
    setShowSettingsMenu,
    setUseRemoteSession,
    secondsLeft,
    onTimeUp,
  } = setters

  useEffect(() => {
    let isMounted = true

    const hydrateAuthIdentity = async () => {
      const resolvedIdentity = await resolveAuthIdentity()

      if (isMounted) {
        onAuthIdentity(resolvedIdentity)
      }
    }

    hydrateAuthIdentity()
    return () => {
      isMounted = false
    }
  }, [onAuthIdentity])

  useEffect(() => {
    resetMatchState()

    if (isLocalOnlyGame) {
      return undefined
    }

    let isCancelled = false

    const initRemoteGame = async () => {
      try {
        const remotePlayers = buildRemotePlayerPayloads({
          roomData,
          players,
          aiSymbol,
          humanSymbol,
          aiDifficulty,
          authIdentity,
        })
        const participants = buildRemoteParticipantPayloads({
          localTurnPlayers,
          players,
        })

        const response = await gameAPI.createGame({
          gameMode,
          boardSize: normalizedBoardSize,
          timeControl,
          opponentType,
          aiDifficulty: opponentType === 'ai' ? aiDifficulty : null,
          playerX: remotePlayers.X,
          playerO: remotePlayers.O,
          participants,
        }, REMOTE_INIT_TIMEOUT_MS)

        if (!response.ok) {
          throw new Error(response.data?.message || response.data?.error || 'Failed to create game')
        }

        if (isCancelled || hasLocalProgressRef.current) {
          return
        }

        setGameId(response.data?.data?.gameId || null)
        setUseRemoteSession(true)
        setCurrentPlayer(response.data?.data?.currentTurn || 'X')
      } catch (error) {
        if (!isCancelled) {
          setUseRemoteSession(false)
          setGameId(null)
          console.error('Failed to initialize backend game session:', error)
        }
      }
    }

    initRemoteGame()
    return () => {
      isCancelled = true
    }
  }, [aiDifficulty, aiSymbol, authIdentity, gameMode, hasLocalProgressRef, humanSymbol, isLocalOnlyGame, localTurnPlayers, normalizedBoardSize, opponentType, players, resetMatchState, roomData, setCurrentPlayer, setGameId, setUseRemoteSession, timeControl])

  useEffect(() => {
    if (!(isAIGame && currentPlayer === aiSymbol && !gameOver && !isMakingMoveRef.current)) {
      return
    }

    const makeAIMove = async () => {
      setMoveMakingState(true)

      try {
        await new Promise((resolve) => window.setTimeout(resolve, aiResponseDelayMs))

        if (gameOverRef.current || currentPlayerRef.current !== aiSymbol || !gameId) {
          return
        }

        const response = await gameAPI.makeAIMove(gameId, REMOTE_MOVE_TIMEOUT_MS)
        if (!response.ok) {
          throw new Error(response.data?.message || response.data?.error || 'Failed to make AI move')
        }

        applyRemoteMoveResult(response.data.data)
      } catch (error) {
        console.error('Failed to request AI move from backend:', error)
      } finally {
        setMoveMakingState(false)
      }
    }

    makeAIMove()
  }, [aiResponseDelayMs, aiSymbol, applyRemoteMoveResult, currentPlayer, gameId, gameOver, gameOverRef, isAIGame, isMakingMoveRef, setMoveMakingState, currentPlayerRef])

  useEffect(() => {
    currentPlayerRef.current = currentPlayer
  }, [currentPlayer, currentPlayerRef])

  useEffect(() => {
    boardRef.current = board
  }, [board, boardRef])

  useEffect(() => {
    if (!isExpandedLocalGame || gameOver || isMakingMoveRef.current || currentLocalPlayer?.type !== 'ai') {
      return undefined
    }

    let isCancelled = false

    const makeExpandedLocalAIMove = async () => {
      setMoveMakingState(true)

      try {
        await new Promise((resolve) => window.setTimeout(
          resolve,
          getLocalAIDelayMs(currentLocalPlayer.aiDifficulty || aiDifficulty, normalizedTimeControl)
        ))

        if (isCancelled || gameOverRef.current || currentPlayerRef.current !== currentLocalPlayer.token) {
          return
        }

        const move = pickExpandedLocalAIMove({
          board: boardRef.current,
          currentLocalPlayer,
          localTurnPlayers,
        })

        if (move) {
          applyLocalMove(move.row, move.col, currentLocalPlayer.token)
        }
      } finally {
        if (!isCancelled) {
          setMoveMakingState(false)
        }
      }
    }

    makeExpandedLocalAIMove()
    return () => {
      isCancelled = true
    }
  }, [aiDifficulty, applyLocalMove, boardRef, currentLocalPlayer, currentPlayerRef, gameOver, gameOverRef, isExpandedLocalGame, isMakingMoveRef, localTurnPlayers, normalizedTimeControl, setMoveMakingState])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver, gameOverRef])

  useEffect(() => {
    turnStartedAtRef.current = Date.now()
    setSecondsLeft(normalizedTimeControl)
    timeoutHandledForTurnRef.current = null
  }, [currentPlayer, normalizedTimeControl, setSecondsLeft, timeoutHandledForTurnRef, turnStartedAtRef])

  useEffect(() => {
    if (gameOver) {
      return undefined
    }

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
          if (!next) {
            setShowGiveUpConfirm(false)
          }
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowGiveUpConfirm, setShowSettingsMenu])

  useEffect(() => {
    if (gameOver || secondsLeft > 0 || timeoutHandledForTurnRef.current === currentPlayer) {
      return
    }

    timeoutHandledForTurnRef.current = currentPlayer
    if (!isMakingMoveRef.current) {
      onTimeUp()
    }
  }, [currentPlayer, gameOver, isMakingMoveRef, onTimeUp, secondsLeft, timeoutHandledForTurnRef])

  useEffect(() => {
    if (!isExpandedLocalGame || !gameOver || !winner || localHistorySavedRef.current) {
      return undefined
    }

    localHistorySavedRef.current = true

    const participants = buildRemoteParticipantPayloads({
      localTurnPlayers,
      players,
    })
    const totalMoves = board.reduce(
      (count, boardRow) => count + boardRow.filter((cell) => cell !== null).length,
      0
    )

    gameAPI.saveLocalHistory({
      boardSize: normalizedBoardSize,
      timeControl: normalizedTimeControl,
      participants,
      winner: winner || 'draw',
      winningTiles,
      totalMoves,
      startedAt: matchStartedAtRef.current,
    }).catch((error) => {
      localHistorySavedRef.current = false
      console.error('Failed to save local game history:', error)
    })

    return undefined
  }, [board, gameOver, isExpandedLocalGame, localHistorySavedRef, localTurnPlayers, matchStartedAtRef, normalizedBoardSize, normalizedTimeControl, players, winner, winningTiles])

  useEffect(() => {
    if (!gameOver || !roomData?._id || roomCleanupDoneRef.current) {
      return undefined
    }

    roomCleanupDoneRef.current = true
    gameroomService.deleteRoom(roomData._id).catch((error) => {
      roomCleanupDoneRef.current = false
      console.error('Failed to delete finished room:', error)
    })
    return undefined
  }, [gameOver, roomData, roomCleanupDoneRef])

}
