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
  setters.setCurrentPlayer(isExpandedLocalGame ? (localTurnPlayers[0]?.token || 'P1') : 'X')
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
  refs.currentPlayerRef.current = isExpandedLocalGame ? (localTurnPlayers[0]?.token || 'P1') : 'X'
  refs.gameOverRef.current = false
  refs.roomCleanupDoneRef.current = false
  refs.localHistorySavedRef.current = false
  if (refs.localMovesRef) {
    refs.localMovesRef.current = []
  }
  if (refs.lastMoveStartedAtRef) {
    refs.lastMoveStartedAtRef.current = Date.now()
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
