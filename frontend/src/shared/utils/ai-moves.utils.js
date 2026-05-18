// AI move selection for each difficulty tier. Pure functions — no React.
import {
  createsLineWithBlockedEnds,
  getEmptyTiles,
  isDoubleThree,
  isRealThreat,
  scoreMove,
  wouldWin,
} from './game.utils.js'

const getRandomMove = (emptyTiles) => {
  if (!emptyTiles.length) return null
  return emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
}

const getWinningMove = (board, player, emptyTiles = getEmptyTiles(board)) =>
  emptyTiles.find(({ row, col }) => wouldWin(board, row, col, player)) || null

const findFirstMatch = (emptyTiles, predicate) => {
  for (const tile of emptyTiles) {
    if (predicate(tile)) return tile
  }
  return null
}

const getEasyMove = (board, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  const winningBlockMoves = emptyTiles.filter(({ row, col }) => wouldWin(board, row, col, humanPlayer))
  if (winningBlockMoves.length) return getRandomMove(winningBlockMoves)

  const openThreeBlockMoves = emptyTiles.filter(({ row, col }) =>
    createsLineWithBlockedEnds(board, row, col, humanPlayer, 4, 0))
  if (openThreeBlockMoves.length) return getRandomMove(openThreeBlockMoves)

  return getRandomMove(emptyTiles)
}

const getMediumMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  const checks = [
    ({ row, col }) => wouldWin(board, row, col, aiPlayer),
    ({ row, col }) => wouldWin(board, row, col, humanPlayer),
    ({ row, col }) => isRealThreat(board, row, col, humanPlayer, 4),
    ({ row, col }) => isRealThreat(board, row, col, humanPlayer, 3),
    ({ row, col }) => isDoubleThree(board, row, col, humanPlayer),
    ({ row, col }) => isDoubleThree(board, row, col, aiPlayer),
  ]
  for (const predicate of checks) {
    const match = findFirstMatch(emptyTiles, predicate)
    if (match) return match
  }
  return getRandomMove(emptyTiles)
}

const countPieces = (board) => {
  let total = 0
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== null) total += 1
    }
  }
  return total
}

const pickBestScoreMove = (emptyTiles, board, aiPlayer, humanPlayer) => {
  let bestScore = -Infinity
  let bestMove = null
  for (const { row, col } of emptyTiles) {
    const score = scoreMove(board, row, col, aiPlayer, humanPlayer)
    if (score > bestScore) {
      bestScore = score
      bestMove = { row, col }
    }
  }
  return bestMove
}

const getHardMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  if (countPieces(board) === 0) {
    const center = Math.floor(board.length / 2)
    return { row: center, col: center }
  }
  const checks = [
    ({ row, col }) => wouldWin(board, row, col, aiPlayer),
    ({ row, col }) => wouldWin(board, row, col, humanPlayer),
    ({ row, col }) => isRealThreat(board, row, col, aiPlayer, 4),
    ({ row, col }) => isRealThreat(board, row, col, humanPlayer, 4),
    ({ row, col }) => isDoubleThree(board, row, col, humanPlayer),
    ({ row, col }) => isDoubleThree(board, row, col, aiPlayer),
    ({ row, col }) => isRealThreat(board, row, col, humanPlayer, 3),
    ({ row, col }) => isRealThreat(board, row, col, aiPlayer, 3),
  ]
  for (const predicate of checks) {
    const match = findFirstMatch(emptyTiles, predicate)
    if (match) return match
  }
  return pickBestScoreMove(emptyTiles, board, aiPlayer, humanPlayer) || getRandomMove(emptyTiles)
}

export function getAIMove(board, difficulty = 'medium', aiPlayer = 'O', humanPlayer = 'X') {
  const emptyTiles = getEmptyTiles(board)
  if (!emptyTiles.length) return null

  const winningMove = getWinningMove(board, aiPlayer, emptyTiles)
  if (winningMove) return winningMove

  switch (difficulty) {
    case 'easy': return getEasyMove(board, humanPlayer)
    case 'medium': return getMediumMove(board, aiPlayer, humanPlayer)
    case 'hard': return getHardMove(board, aiPlayer, humanPlayer)
    default: return getRandomMove(emptyTiles)
  }
}
