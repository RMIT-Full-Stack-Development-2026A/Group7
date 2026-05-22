import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../../../router/routes.config.js'
import { getWinningTiles } from '../../../shared/utils/game.utils.js'
import { gameAPI } from '../../../config/api/game.api.js'
import { gameroomSocketService } from '../../gameroom/services/gameroomSocketService.js'
import {
  completeMove,
  getNextLocalPlayerToken,
  recordLocalMove,
  resolveResultTone,
} from '../logic/gameboardMoveHelpers.js'
import {
  applyRemoteMoveResult as applyRemoteMoveResultTransition,
  resetMatchState,
} from '../logic/gameboardStateTransitions.js'
import { buildRemoteParticipantPayloads, REMOTE_MOVE_TIMEOUT_MS } from '../logic/gameboardLogic.js'

export const useGameBoardActions = ({
  authIdentity,
  emptyBoard,
  humanSymbol,
  isAIGame,
  isExpandedLocalGame,
  isLocalOnlyGame,
  isRoomMultiplayerGame,
  localTurnPlayers,
  normalizedBoardSize,
  normalizedTimeControl,
  onGameEnd,
  players,
  refs,
  roomData,
  setters,
  state,
  viewerLocalToken,
  viewerSymbol,
  currentLocalPlayer,
}) => {
  const navigate = useNavigate()
  const applyLocalMoveRef = useRef(null)
  const applyResignationResultRef = useRef(null)

  const resolveResultToneFromSymbol = useCallback(
    (winningSymbol) => (
      isExpandedLocalGame
        ? resolveResultTone(winningSymbol, viewerLocalToken)
        : resolveResultTone(winningSymbol, viewerSymbol)
    ),
    [isExpandedLocalGame, viewerLocalToken, viewerSymbol],
  )

  const applyRemoteMoveResult = useCallback((moveResult) => applyRemoteMoveResultTransition({
    moveResult, setters, resolveResultToneFromSymbol, getWinningTiles,
  }), [resolveResultToneFromSymbol, setters])

  const applyLocalMove = useCallback((row, col, player) => {
    const nextBoard = recordLocalMove({ refs, state, row, col, player })
    if (!nextBoard) return false
    completeMove({
      nextBoard, row, col, player,
      boardRef: refs.boardRef,
      isExpandedLocalGame, localTurnPlayers, resolveResultToneFromSymbol,
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
  }, [isExpandedLocalGame, localTurnPlayers, refs, resolveResultToneFromSymbol, setters, state])

  useEffect(() => { applyLocalMoveRef.current = applyLocalMove }, [applyLocalMove])

  const emitRoomMove = useCallback((row, col, player) => {
    if (!isRoomMultiplayerGame || !roomData?.roomId) return
    gameroomSocketService.emit('game-move', { roomId: roomData.roomId, row, col, player })
  }, [isRoomMultiplayerGame, roomData?.roomId])

  const applyResignationResult = useCallback(({ winner, resignedBy }) => {
    if (!winner || refs.gameOverRef.current) return
    setters.setShowGiveUpConfirm(false)
    setters.setShowSettingsMenu(false)
    setters.setMoveMakingState(false)
    setters.setGameOver(true)
    setters.setWinningTiles([])
    setters.setShowWinAnimation(false)
    setters.setWinner(winner)
    setters.setResultTone(resolveResultToneFromSymbol(winner))
    setters.setShowPopup(true)
    refs.gameOverRef.current = true
    if (resignedBy) console.info(`Player ${resignedBy} resigned. ${winner} wins.`)
  }, [refs.gameOverRef, resolveResultToneFromSymbol, setters])

  useEffect(() => { applyResignationResultRef.current = applyResignationResult }, [applyResignationResult])

  const resolveNextPlayer = useCallback((player) => (
    isExpandedLocalGame ? getNextLocalPlayerToken(player, isExpandedLocalGame, localTurnPlayers) : (player === 'X' ? 'O' : 'X')
  ), [isExpandedLocalGame, localTurnPlayers])

  const applyTurnSkip = useCallback(({ skippedPlayer, nextPlayer } = {}) => {
    if (refs.gameOverRef.current) return
    setters.setCurrentPlayer((player) => {
      const playerToSkip = skippedPlayer || player
      if (player !== playerToSkip) return player
      return nextPlayer || resolveNextPlayer(player)
    })
  }, [refs.gameOverRef, resolveNextPlayer, setters])

  const emitRoomResignation = useCallback((winner, resignedBy) => {
    if (!isRoomMultiplayerGame || !roomData?.roomId) return
    gameroomSocketService.emit('game-action', {
      roomId: roomData.roomId,
      action: 'player-resigned',
      payload: { winner, resignedBy },
    })
  }, [isRoomMultiplayerGame, roomData?.roomId])

  useEffect(() => {
    if (!isRoomMultiplayerGame || !roomData?.roomId) return undefined

    const viewerId = authIdentity?.userId || authIdentity?.id || 'anonymous'
    const viewerName = authIdentity?.name || authIdentity?.username || 'Player'
    gameroomSocketService.joinRoom({ roomId: roomData.roomId, playerId: viewerId, playerName: viewerName })

    const unsubscribeMove = gameroomSocketService.on('game-move-applied', ({ row, col, player }) => {
      if (Number.isInteger(row) && Number.isInteger(col) && player) {
        applyLocalMoveRef.current?.(row, col, player)
      }
    })
    const unsubscribeAction = gameroomSocketService.on('game-action', ({ action, payload } = {}) => {
      if (action === 'player-resigned') applyResignationResultRef.current?.(payload || {})
      if (action === 'turn-skipped') applyTurnSkip(payload || {})
    })

    return () => {
      unsubscribeMove()
      unsubscribeAction()
      gameroomSocketService.leaveRoom(roomData.roomId)
    }
  }, [applyTurnSkip, authIdentity?.id, authIdentity?.name, authIdentity?.userId, authIdentity?.username, isRoomMultiplayerGame, roomData?.roomId])

  // Admin can close a room (status 'in-battle' or otherwise) at any time. The
  // socket broadcast must kick every player from the live match — including
  // single-player/AI rooms where the multiplayer effect above never attaches —
  // and the active Game record must be deleted so the aborted match never
  // surfaces in game history.
  useEffect(() => {
    if (!roomData?.roomId) return undefined

    const viewerId = authIdentity?.userId || authIdentity?.id || 'anonymous'
    const viewerName = authIdentity?.name || authIdentity?.username || 'Player'
    gameroomSocketService.joinRoom({ roomId: roomData.roomId, playerId: viewerId, playerName: viewerName })

    const handleAdminClose = async (payload = {}) => {
      if (String(payload?.roomId) !== String(roomData.roomId)) return
      if (refs.gameOverRef.current) return
      refs.gameOverRef.current = true
      setters.setMoveMakingState(false)
      setters.setShowPopup(false)
      setters.setShowSettingsMenu(false)
      setters.setShowGiveUpConfirm(false)
      setters.setGameOver(true)

      if (state.useRemoteSession && state.gameId) {
        try { await gameAPI.abortGame(state.gameId, { persist: false }) }
        catch (error) { console.error('Failed to abort game on admin close:', error) }
      }

      if (onGameEnd) onGameEnd(null)
      window.alert(payload?.message || 'This match has been closed by an admin.')
      navigate(ROUTES.MAIN_MENU)
    }

    const unsubscribeAdminClose = gameroomSocketService.on('room-closed-by-admin', handleAdminClose)
    return () => {
      unsubscribeAdminClose()
    }
  }, [authIdentity?.id, authIdentity?.name, authIdentity?.userId, authIdentity?.username, navigate, onGameEnd, refs.gameOverRef, roomData?.roomId, setters, state.gameId, state.useRemoteSession])

  // Chess-clock timeout: the player whose bank reached zero forfeits the
  // match. We resign them server-side (if remote), broadcast the resignation
  // to other clients in a multiplayer room, and apply the local result.
  const handleClockTimeout = useCallback(async () => {
    if (refs.gameOverRef.current) return

    const timedOutPlayer = refs.currentPlayerRef.current || state.currentPlayer
    if (!timedOutPlayer) return

    const opponentWinner = resolveNextPlayer(timedOutPlayer)

    if (state.useRemoteSession && state.gameId) {
      setters.setMoveMakingState(true)
      try {
        const response = await gameAPI.resignGame(state.gameId)
        if (!response.ok) {
          console.warn('Backend resign on clock timeout failed:', response.data?.message || response.data?.error)
        }
      } catch (error) {
        console.error('Failed to resign timed-out game:', error)
      } finally {
        setters.setMoveMakingState(false)
      }
    }

    applyResignationResult({ winner: opponentWinner, resignedBy: timedOutPlayer })
    emitRoomResignation(opponentWinner, timedOutPlayer)
  }, [applyResignationResult, emitRoomResignation, refs.currentPlayerRef, refs.gameOverRef, resolveNextPlayer, setters, state.currentPlayer, state.gameId, state.useRemoteSession])

  const resetCurrentMatchState = useCallback(() => resetMatchState({
    refs, setters, emptyBoard, isExpandedLocalGame, localTurnPlayers, normalizedTimeControl,
  }), [emptyBoard, isExpandedLocalGame, localTurnPlayers, normalizedTimeControl, refs, setters])

  const openSettingsMenu = () => { setters.setShowGiveUpConfirm(false); setters.setShowSettingsMenu(true) }
  const closeSettingsMenu = () => { setters.setShowGiveUpConfirm(false); setters.setShowSettingsMenu(false) }

  const handleGiveUp = async () => {
    const resignedBy = isExpandedLocalGame
      ? (viewerLocalToken || (!isRoomMultiplayerGame ? state.currentPlayer : null))
      : (viewerSymbol || (!isRoomMultiplayerGame ? state.currentPlayer : null))

    if (!resignedBy || state.gameOver) return

    const opponentSymbol = isExpandedLocalGame
      ? getNextLocalPlayerToken(resignedBy, isExpandedLocalGame, localTurnPlayers)
      : (resignedBy === 'X' ? 'O' : 'X')

    setters.setShowGiveUpConfirm(false)
    setters.setShowSettingsMenu(false)

    if (state.useRemoteSession && state.gameId) {
      try { await gameAPI.resignGame(state.gameId) }
      catch (error) { console.error('Failed to resign backend game:', error) }
    }

    applyResignationResult({ winner: opponentSymbol, resignedBy })
    emitRoomResignation(opponentSymbol, resignedBy)
  }

  const handleTileClick = async (row, col) => {
    if (refs.isMakingMoveRef.current || state.gameOver
      || (isAIGame && state.currentPlayer !== humanSymbol)
      || state.board[row]?.[col]) return

    if (isExpandedLocalGame && currentLocalPlayer?.type !== 'ai') {
      if ((isRoomMultiplayerGame || viewerLocalToken) && state.currentPlayer !== viewerLocalToken) return
    }

    if (isRoomMultiplayerGame && !isExpandedLocalGame && state.currentPlayer !== viewerSymbol) return

    setters.setMoveMakingState(true)
    const elapsedSeconds = Math.max(0, normalizedTimeControl - state.secondsLeft)

    try {
      if (state.useRemoteSession && state.gameId) {
        const response = await gameAPI.makeMove(state.gameId, { row, col, timeTaken: elapsedSeconds }, REMOTE_MOVE_TIMEOUT_MS)
        if (!response.ok) throw new Error(response.data?.message || response.data?.error || 'Move failed')
        applyRemoteMoveResult(response.data.data)
        return
      }

      const didApplyMove = applyLocalMove(row, col, state.currentPlayer)
      if (didApplyMove) emitRoomMove(row, col, state.currentPlayer)
    } catch (error) {
      if (!isAIGame) applyLocalMove(row, col, state.currentPlayer)
      else console.error('Failed to submit move to backend:', error)
    } finally {
      setters.setMoveMakingState(false)
    }
  }

  const returnToMainMenu = () => {
    setters.setShowPopup(false)
    if (onGameEnd) onGameEnd(state.winner)
    navigate(ROUTES.MAIN_MENU)
  }

  const handleAbort = async () => {
    setters.setShowGiveUpConfirm(false)
    setters.setShowSettingsMenu(false)

    if (state.useRemoteSession && state.gameId) {
      try { await gameAPI.abortGame(state.gameId, { persist: true, reason: 'resignation' }) }
      catch (error) { console.error('Failed to abort backend game:', error) }
    } else if (isLocalOnlyGame && !refs.localHistorySavedRef.current) {
      const recordedMoves = Array.isArray(refs.localMovesRef?.current) ? refs.localMovesRef.current : []
      if (recordedMoves.length > 0) {
        refs.localHistorySavedRef.current = true
        try {
          const participants = buildRemoteParticipantPayloads({ localTurnPlayers, players })
          await gameAPI.saveLocalHistory({
            boardSize: normalizedBoardSize,
            timeControl: normalizedTimeControl,
            participants,
            winner: null,
            winningTiles: [],
            totalMoves: recordedMoves.length,
            startedAt: refs.matchStartedAtRef.current,
            moves: recordedMoves,
            status: 'abandoned',
          })
        } catch (error) {
          refs.localHistorySavedRef.current = false
          console.error('Failed to save aborted local game:', error)
        }
      }
    }
    if (onGameEnd) onGameEnd(null)
    navigate(ROUTES.MAIN_MENU)
  }

  return {
    resolveResultToneFromSymbol,
    applyRemoteMoveResult,
    applyLocalMove,
    emitRoomMove,
    applyResignationResult,
    emitRoomResignation,
    handleClockTimeout,
    resetCurrentMatchState,
    openSettingsMenu,
    closeSettingsMenu,
    handleGiveUp,
    handleTileClick,
    returnToMainMenu,
    handleAbort,
  }
}
