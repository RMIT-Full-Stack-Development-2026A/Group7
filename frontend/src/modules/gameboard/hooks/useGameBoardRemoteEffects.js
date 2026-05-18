import { useEffect } from 'react'
import { gameAPI } from '../../../config/api/game.api.js'
import { resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js'
import {
  buildRemoteParticipantPayloads,
  buildRemotePlayerPayloads,
  REMOTE_INIT_TIMEOUT_MS,
  REMOTE_MOVE_TIMEOUT_MS,
} from '../logic/gameboardLogic.js'

export const useGameBoardRemoteEffects = ({
  aiDifficulty,
  aiResponseDelayMs,
  aiSymbol,
  applyRemoteMoveResult,
  authIdentity,
  currentPlayer,
  gameId,
  gameMode,
  gameOver,
  humanSymbol,
  isAIGame,
  isLocalOnlyGame,
  localTurnPlayers,
  normalizedBoardSize,
  onAuthIdentity,
  opponentType,
  players,
  refs,
  resetMatchState,
  roomData,
  setters,
  timeControl,
}) => {
  const {
    currentPlayerRef,
    gameOverRef,
    hasLocalProgressRef,
    remoteAIMoveRequestRef,
  } = refs
  const {
    setCurrentPlayer,
    setGameId,
    setMoveMakingState,
    setUseRemoteSession,
  } = setters

  useEffect(() => {
    let isMounted = true
    const hydrateAuthIdentity = async () => {
      const resolvedIdentity = await resolveAuthIdentity()
      if (isMounted) onAuthIdentity(resolvedIdentity)
    }
    hydrateAuthIdentity()
    return () => { isMounted = false }
  }, [onAuthIdentity])

  useEffect(() => {
    resetMatchState()
    if (isLocalOnlyGame) return undefined

    let isCancelled = false
    setMoveMakingState(true)

    const initRemoteGame = async () => {
      try {
        const remotePlayers = buildRemotePlayerPayloads({
          roomData, players, aiSymbol, humanSymbol, aiDifficulty, authIdentity,
        })
        const participants = buildRemoteParticipantPayloads({
          localTurnPlayers, players, remotePlayers,
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
        if (isCancelled || hasLocalProgressRef.current) return

        setGameId(response.data?.data?.gameId || null)
        setUseRemoteSession(true)
        setCurrentPlayer(response.data?.data?.currentTurn || 'X')
      } catch (error) {
        if (!isCancelled) {
          setUseRemoteSession(false)
          setGameId(null)
          console.error('Failed to initialize backend game session:', error)
        }
      } finally {
        if (!isCancelled) setMoveMakingState(false)
      }
    }

    initRemoteGame()
    return () => {
      isCancelled = true
      setMoveMakingState(false)
    }
  }, [aiDifficulty, aiSymbol, authIdentity, gameMode, hasLocalProgressRef, humanSymbol, isLocalOnlyGame, localTurnPlayers, normalizedBoardSize, opponentType, players, resetMatchState, roomData, setCurrentPlayer, setGameId, setMoveMakingState, setUseRemoteSession, timeControl])

  useEffect(() => {
    if (!(isAIGame && currentPlayer === aiSymbol && !gameOver && gameId)) return undefined

    const requestKey = `${gameId}:${aiSymbol}`
    if (remoteAIMoveRequestRef.current.key === requestKey) return undefined

    const requestId = remoteAIMoveRequestRef.current.id + 1
    remoteAIMoveRequestRef.current = { id: requestId, key: requestKey }
    setMoveMakingState(true)

    const clearActiveRequest = () => {
      if (remoteAIMoveRequestRef.current.id === requestId) {
        remoteAIMoveRequestRef.current = { id: requestId }
        setMoveMakingState(false)
      }
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        if (remoteAIMoveRequestRef.current.id !== requestId
          || gameOverRef.current
          || currentPlayerRef.current !== aiSymbol) return

        const response = await gameAPI.makeAIMove(gameId, REMOTE_MOVE_TIMEOUT_MS)
        if (remoteAIMoveRequestRef.current.id !== requestId
          || gameOverRef.current
          || currentPlayerRef.current !== aiSymbol) return

        if (!response.ok) {
          throw new Error(response.data?.message || response.data?.error || 'Failed to make AI move')
        }
        applyRemoteMoveResult(response.data.data)
      } catch (error) {
        console.error('Failed to request AI move from backend:', error)
      } finally {
        clearActiveRequest()
      }
    }, aiResponseDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
      clearActiveRequest()
    }
  }, [aiResponseDelayMs, aiSymbol, applyRemoteMoveResult, currentPlayer, currentPlayerRef, gameId, gameOver, gameOverRef, isAIGame, remoteAIMoveRequestRef, setMoveMakingState])
}
