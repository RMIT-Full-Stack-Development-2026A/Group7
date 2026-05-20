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
import { REMOTE_MOVE_TIMEOUT_MS } from '../logic/gameboardLogic.js'

export const useGameBoardActions = ({
  authIdentity,
  emptyBoard,
  humanSymbol,
  isAIGame,
  isExpandedLocalGame,
  isRoomMultiplayerGame,
  localTurnPlayers,
  normalizedTimeControl,
  onGameEnd,
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

  const skipCurrentTurn = useCallback(async () => {
    if (refs.gameOverRef.current) return

    const skippedPlayer = refs.currentPlayerRef.current || state.currentPlayer
    const nextPlayer = resolveNextPlayer(skippedPlayer)
    const timeTaken = Math.max(0, normalizedTimeControl - state.secondsLeft)
      || normalizedTimeControl

    if (isRoomMultiplayerGame && roomData?.roomId) {
      gameroomSocketService.emit('game-action', {
        roomId: roomData.roomId,
        action: 'turn-skipped',
        payload: { skippedPlayer, nextPlayer },
      })
      return
    }

    if (state.useRemoteSession && state.gameId) {
      setters.setMoveMakingState(true)
      try {
        const response = await gameAPI.skipTurn(
          state.gameId,
          { player: skippedPlayer, timeTaken },
          REMOTE_MOVE_TIMEOUT_MS
        )
        if (!response.ok) throw new Error(response.data?.message || response.data?.error || 'Skip turn failed')
        applyTurnSkip({
          skippedPlayer: response.data?.data?.skippedPlayer || skippedPlayer,
          nextPlayer: response.data?.data?.currentTurn || nextPlayer,
        })
      } catch (error) {
        console.error('Failed to skip timed-out turn:', error)
      } finally {
        setters.setMoveMakingState(false)
      }
      return
    }

    applyTurnSkip({ skippedPlayer, nextPlayer })
  }, [applyTurnSkip, isRoomMultiplayerGame, normalizedTimeControl, refs.currentPlayerRef, refs.gameOverRef, resolveNextPlayer, roomData?.roomId, setters, state.currentPlayer, state.gameId, state.secondsLeft, state.useRemoteSession])

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
      try { await gameAPI.abortGame(state.gameId) }
      catch (error) { console.error('Failed to abort backend game:', error) }
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
    skipCurrentTurn,
    resetCurrentMatchState,
    openSettingsMenu,
    closeSettingsMenu,
    handleGiveUp,
    handleTileClick,
    returnToMainMenu,
    handleAbort,
  }
}
