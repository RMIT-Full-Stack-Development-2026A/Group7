// Build the per-player chess-clock bank map. Each tracked player starts with
// `normalizedTimeControl` seconds. For 2-player games we cover X/O; for the
// expanded local game we cover every turn token in playerOrder.
const buildInitialPlayerClocks = ({ isExpandedLocalGame, localTurnPlayers, normalizedTimeControl }) => {
  if (isExpandedLocalGame && Array.isArray(localTurnPlayers) && localTurnPlayers.length > 0) {
    return localTurnPlayers.reduce((accumulator, player) => {
      if (player?.token) accumulator[player.token] = normalizedTimeControl
      return accumulator
    }, {})
  }
  return { X: normalizedTimeControl, O: normalizedTimeControl }
}

export const resetMatchState = ({
  refs,
  setters,
  emptyBoard,
  isExpandedLocalGame,
  localTurnPlayers,
  normalizedTimeControl,
}) => {
  refs.hasLocalProgressRef.current = false
  setters.setMoveMakingState(false)
  refs.boardRef.current = emptyBoard
  setters.setBoard(emptyBoard)
  const initialPlayer = isExpandedLocalGame ? (localTurnPlayers[0]?.token || 'P1') : 'X'
  setters.setCurrentPlayer(initialPlayer)
  setters.setLastMove(null)
  setters.setGameOver(false)
  setters.setGameId(null)
  setters.setUseRemoteSession(false)
  setters.setWinningTiles([])
  setters.setShowWinAnimation(false)
  setters.setWinner(null)
  setters.setResultTone(null)
  setters.setShowPopup(false)
  setters.setShowSettingsMenu(false)
  setters.setShowGiveUpConfirm(false)
  setters.setSecondsLeft(normalizedTimeControl)
  refs.turnStartedAtRef.current = Date.now()
  refs.matchStartedAtRef.current = new Date().toISOString()
  refs.timeoutHandledForTurnRef.current = null
  refs.currentPlayerRef.current = initialPlayer
  refs.gameOverRef.current = false
  refs.roomCleanupDoneRef.current = false
  refs.localHistorySavedRef.current = false
  if (refs.localMovesRef) {
    refs.localMovesRef.current = []
  }
  if (refs.lastMoveStartedAtRef) {
    refs.lastMoveStartedAtRef.current = Date.now()
  }
  if (refs.playerClocksRef) {
    refs.playerClocksRef.current = buildInitialPlayerClocks({
      isExpandedLocalGame, localTurnPlayers, normalizedTimeControl,
    })
  }
  if (refs.previousPlayerRef) {
    refs.previousPlayerRef.current = initialPlayer
  }
}

export const applyRemoteMoveResult = ({
  moveResult,
  setters,
  resolveResultToneFromSymbol,
  getWinningTiles,
}) => {
  setters.setBoard((currentBoard) => {
    const nextBoard = currentBoard.map((boardRow) => [...boardRow])
    nextBoard[moveResult.row][moveResult.col] = moveResult.player

    if (moveResult.isWin) {
      setters.setWinningTiles(getWinningTiles(nextBoard, moveResult.row, moveResult.col, moveResult.player))
      setters.setWinner(moveResult.player)
      setters.setResultTone(resolveResultToneFromSymbol(moveResult.player))
      setters.setShowWinAnimation(true)
      setters.setLastMove({ row: moveResult.row, col: moveResult.col })
      setters.setGameOver(true)

      window.setTimeout(() => {
        setters.setShowWinAnimation(false)
        setters.setShowPopup(true)
      }, 700)

      return nextBoard
    }

    setters.setLastMove({ row: moveResult.row, col: moveResult.col })

    if (moveResult.isDraw) {
      setters.setGameOver(true)
      setters.setWinner('draw')
      setters.setResultTone('draw')
      setters.setShowPopup(true)
      return nextBoard
    }

    setters.setCurrentPlayer(moveResult.currentTurn)
    return nextBoard
  })
}
