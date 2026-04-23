const {
  wouldWin,
  isDoubleThree,
  isRealThreat,
  scoreMove,
} = require('../../shared/utils/game.utils')

const getEmptyTiles = (board) => {
  const emptyTiles = []

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] === null) {
        emptyTiles.push({ row, col })
      }
    }
  }

  return emptyTiles
}

const getRandomMove = (emptyTiles) => {
  if (!emptyTiles.length) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * emptyTiles.length)
  return emptyTiles[randomIndex]
}

const getMediumMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)

  for (const { row, col } of emptyTiles) {
    if (wouldWin(board, row, col, aiPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (wouldWin(board, row, col, humanPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isRealThreat(board, row, col, humanPlayer, 4)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isRealThreat(board, row, col, humanPlayer, 3)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isDoubleThree(board, row, col, humanPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isDoubleThree(board, row, col, aiPlayer)) return { row, col }
  }

  return getRandomMove(emptyTiles)
}

const getHardMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  let totalPieces = 0

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== null) {
        totalPieces += 1
      }
    }
  }

  if (totalPieces === 0) {
    const center = Math.floor(board.length / 2)
    return { row: center, col: center }
  }

  for (const { row, col } of emptyTiles) {
    if (wouldWin(board, row, col, aiPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (wouldWin(board, row, col, humanPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isRealThreat(board, row, col, aiPlayer, 4)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isRealThreat(board, row, col, humanPlayer, 4)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isDoubleThree(board, row, col, humanPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isDoubleThree(board, row, col, aiPlayer)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isRealThreat(board, row, col, humanPlayer, 3)) return { row, col }
  }

  for (const { row, col } of emptyTiles) {
    if (isRealThreat(board, row, col, aiPlayer, 3)) return { row, col }
  }

  let bestScore = -Infinity
  let bestMove = null

  for (const { row, col } of emptyTiles) {
    const score = scoreMove(board, row, col, aiPlayer, humanPlayer)
    if (score > bestScore) {
      bestScore = score
      bestMove = { row, col }
    }
  }

  return bestMove || getRandomMove(emptyTiles)
}

const getAIMove = (board, difficulty = 'medium', aiPlayer = 'O', humanPlayer = 'X') => {
  const emptyTiles = getEmptyTiles(board)

  if (!emptyTiles.length) {
    return null
  }

  switch (difficulty) {
    case 'easy':
      return getRandomMove(emptyTiles)
    case 'medium':
      return getMediumMove(board, aiPlayer, humanPlayer)
    case 'hard':
      return getHardMove(board, aiPlayer, humanPlayer)
    default:
      return getRandomMove(emptyTiles)
  }
}

module.exports = {
  getAIMove,
}
