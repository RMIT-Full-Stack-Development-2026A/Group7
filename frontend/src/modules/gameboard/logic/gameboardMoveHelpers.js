import {
  checkWin,
  getAIMove,
  getEmptyTiles,
  getWinningTiles,
  isBoardFull,
  wouldWin,
} from '../../../shared/utils/game.utils.js'
import { AI_DELAY_BY_DIFFICULTY_MS } from './gameboardLogic.js'

export const createEmptyBoard = (boardSize) => (
  Array.from({ length: boardSize }, () => Array(boardSize).fill(null))
)

export const getNextLocalPlayerToken = (playerToken, isExpandedLocalGame, localTurnPlayers) => {
  if (!isExpandedLocalGame || localTurnPlayers.length === 0) {
    return playerToken
  }

  const currentIndex = localTurnPlayers.findIndex((player) => player.token === playerToken)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % localTurnPlayers.length : 0
  return localTurnPlayers[nextIndex]?.token || playerToken
}

export const resolveResultTone = (winningSymbol, viewerSymbol) => {
  if (winningSymbol === 'draw') {
    return 'draw'
  }

  if (!viewerSymbol) {
    return 'win'
  }

  return winningSymbol === viewerSymbol ? 'win' : 'lose'
}

// Record a local move into the moves ref and return the next board.
// Returns null if the target tile is already taken.
export const recordLocalMove = ({
  refs, state, row, col, player,
}) => {
  const activeBoard = refs.boardRef.current?.length ? refs.boardRef.current : state.board
  if (!activeBoard[row] || activeBoard[row][col] !== null) return null

  refs.hasLocalProgressRef.current = true
  const now = Date.now()
  const matchStartMs = refs.matchStartedAtRef.current
    ? new Date(refs.matchStartedAtRef.current).getTime()
    : now
  const previousMoveStartMs = refs.lastMoveStartedAtRef.current || matchStartMs
  const elapsedMs = Math.max(0, now - previousMoveStartMs)
  refs.lastMoveStartedAtRef.current = now

  if (!Array.isArray(refs.localMovesRef.current)) {
    refs.localMovesRef.current = []
  }
  refs.localMovesRef.current.push({
    moveNumber: refs.localMovesRef.current.length + 1,
    player, row, col,
    timeTaken: Math.round(elapsedMs / 1000),
  })

  const nextBoard = activeBoard.map((boardRow) => [...boardRow])
  nextBoard[row][col] = player
  return nextBoard
}

export const completeMove = ({
  nextBoard,
  row,
  col,
  player,
  boardRef,
  isExpandedLocalGame,
  localTurnPlayers,
  resolveResultToneFromSymbol,
  setWinningTiles,
  setWinner,
  setResultTone,
  setShowWinAnimation,
  setBoard,
  setLastMove,
  setGameOver,
  setShowPopup,
  setCurrentPlayer,
}) => {
  const isWin = checkWin(nextBoard, row, col, player)
  boardRef.current = nextBoard

  if (isWin) {
    const winningTilesList = getWinningTiles(nextBoard, row, col, player)
    setWinningTiles(winningTilesList)
    setWinner(player)
    setResultTone(resolveResultToneFromSymbol(player))
    setShowWinAnimation(true)
    setBoard(nextBoard)
    setLastMove({ row, col })
    setGameOver(true)

    window.setTimeout(() => {
      setShowWinAnimation(false)
      setShowPopup(true)
    }, 700)
    return
  }

  setBoard(nextBoard)
  setLastMove({ row, col })

  if (isBoardFull(nextBoard)) {
    setGameOver(true)
    setWinner('draw')
    setResultTone('draw')
    setShowPopup(true)
    return
  }

  setCurrentPlayer(
    isExpandedLocalGame
      ? getNextLocalPlayerToken(player, isExpandedLocalGame, localTurnPlayers)
      : (player === 'X' ? 'O' : 'X')
  )
}

export const pickExpandedLocalAIMove = ({ board, currentLocalPlayer, localTurnPlayers, lastMove = null }) => {
  const aiToken = currentLocalPlayer.token
  const opponents = localTurnPlayers.filter((player) => player.token !== aiToken)
  const difficulty = currentLocalPlayer.aiDifficulty || 'medium'

  // Easy AI only looks at neighbours of the most recent human move; bypass the
  // other heuristics so the spec rule is preserved.
  if (difficulty === 'easy') {
    return getAIMove(board, 'easy', aiToken, opponents[0]?.token || 'X', lastMove)
  }

  const emptyTiles = getEmptyTiles(board)

  for (const { row, col } of emptyTiles) {
    if (wouldWin(board, row, col, aiToken)) {
      return { row, col }
    }
  }

  for (const opponent of opponents) {
    for (const { row, col } of emptyTiles) {
      if (wouldWin(board, row, col, opponent.token)) {
        return { row, col }
      }
    }
  }

  let primaryThreat = opponents[0] || null
  let highestThreatScore = -1

  opponents.forEach((opponent) => {
    const threatScore = board.reduce(
      (count, boardRow) => count + boardRow.filter((cell) => cell === opponent.token).length,
      0
    )

    if (threatScore > highestThreatScore) {
      highestThreatScore = threatScore
      primaryThreat = opponent
    }
  })

  return getAIMove(
    board,
    difficulty,
    aiToken,
    primaryThreat?.token || opponents[0]?.token || 'X',
    lastMove,
  )
}

export const getLocalAIDelayMs = (difficulty, normalizedTimeControl) => {
  const desiredDelay = AI_DELAY_BY_DIFFICULTY_MS[difficulty] || AI_DELAY_BY_DIFFICULTY_MS.medium
  return Math.min(desiredDelay, normalizedTimeControl * 1000)
}
