const {
  wouldWin,
  isDoubleThree,
  isRealThreat,
  createsLineWithBlockedEnds,
  scoreMove,
} = require('../../shared/utils/game.utils')

// ---------- helpers ----------
const getEmptyTiles = (board) => {
  const emptyTiles = []
  for (let r = 0; r < board.length; r += 1) {
    for (let c = 0; c < board[r].length; c += 1) {
      if (board[r][c] === null) emptyTiles.push({ row: r, col: c })
    }
  }
  return emptyTiles
}

const getRandomMove = (emptyTiles) => {
  if (!emptyTiles.length) return null
  return emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
}

const getWinningMove = (board, player, emptyTiles = getEmptyTiles(board)) =>
  emptyTiles.find(({ row, col }) => wouldWin(board, row, col, player)) || null

// ---------- Easy (unchanged) ----------
const getEasyMove = (board, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  const winBlock = emptyTiles.filter(({ row, col }) =>
    wouldWin(board, row, col, humanPlayer)
  )
  if (winBlock.length) return getRandomMove(winBlock)

  const openThreeBlock = emptyTiles.filter(({ row, col }) =>
    createsLineWithBlockedEnds(board, row, col, humanPlayer, 4, 0)
  )
  if (openThreeBlock.length) return getRandomMove(openThreeBlock)

  return getRandomMove(emptyTiles)
}

// ---------- Medium (previous "hard" logic) ----------
const getMediumMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)

  // 1) Win
  for (const { row, col } of emptyTiles)
    if (wouldWin(board, row, col, aiPlayer)) return { row, col }

  // 2) Block opponent win
  for (const { row, col } of emptyTiles)
    if (wouldWin(board, row, col, humanPlayer)) return { row, col }

  // 3) Block real threat (open four)
  for (const { row, col } of emptyTiles)
    if (isRealThreat(board, row, col, humanPlayer, 4)) return { row, col }

  // 4) Block real threat (open three)
  for (const { row, col } of emptyTiles)
    if (isRealThreat(board, row, col, humanPlayer, 3)) return { row, col }

  // 5) Block opponent double-three
  for (const { row, col } of emptyTiles)
    if (isDoubleThree(board, row, col, humanPlayer)) return { row, col }

  // 6) Create own double-three
  for (const { row, col } of emptyTiles)
    if (isDoubleThree(board, row, col, aiPlayer)) return { row, col }

  return getRandomMove(emptyTiles)
}

// ---------- Hard (new minimax) ----------
// Move ordering & candidate generation: only tiles near existing stones
const NEIGHBOUR_RADIUS = 2

const getNeighbourMoves = (board) => {
  const size = board.length
  const candidates = new Set()
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        for (let dr = -NEIGHBOUR_RADIUS; dr <= NEIGHBOUR_RADIUS; dr++) {
          for (let dc = -NEIGHBOUR_RADIUS; dc <= NEIGHBOUR_RADIUS; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (
              nr >= 0 && nr < size &&
              nc >= 0 && nc < size &&
              board[nr][nc] === null
            ) {
              candidates.add(`${nr},${nc}`)
            }
          }
        }
      }
    }
  }
  // fallback: if board is almost empty, return center
  if (candidates.size === 0) {
    const mid = Math.floor(size / 2)
    return [{ row: mid, col: mid }]
  }
  return Array.from(candidates).map(s => {
    const [r, c] = s.split(',').map(Number)
    return { row: r, col: c }
  })
}

// Board evaluation from the AI's perspective (higher = better for AI)
const evaluateBoard = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  let aiScore = 0
  let humanScore = 0
  for (const { row, col } of emptyTiles) {
    aiScore += scoreMove(board, row, col, aiPlayer, humanPlayer)
    humanScore += scoreMove(board, row, col, humanPlayer, aiPlayer)
  }
  return aiScore - humanScore
}

const applyMove = (board, row, col, player) => { board[row][col] = player }
const undoMove = (board, row, col) => { board[row][col] = null }

const minimax = (
  board,
  depth,
  alpha,
  beta,
  isMaximizing,
  aiPlayer,
  humanPlayer
) => {
  // Terminal checks
  const opponent = isMaximizing ? humanPlayer : aiPlayer
  const emptyTiles = getEmptyTiles(board)
  if (emptyTiles.length === 0) return 0 // draw

  // Immediate win for current player?
  if (isMaximizing) {
    if (getWinningMove(board, aiPlayer, emptyTiles)) return 100000 + depth
  } else {
    if (getWinningMove(board, humanPlayer, emptyTiles)) return -100000 - depth
  }

  if (depth === 0) {
    const evalScore = evaluateBoard(board, aiPlayer, humanPlayer)
    return isMaximizing ? evalScore : -evalScore
  }

  // Move generation with ordering
  let moves = getNeighbourMoves(board)
  // Order moves: immediate wins/threats first
  moves.sort((a, b) => {
    const scoreA = scoreMove(board, a.row, a.col, isMaximizing ? aiPlayer : humanPlayer, opponent)
    const scoreB = scoreMove(board, b.row, b.col, isMaximizing ? aiPlayer : humanPlayer, opponent)
    return scoreB - scoreA // descending
  })
  // Limit branching
  if (moves.length > 20) moves = moves.slice(0, 20)

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const { row, col } of moves) {
      applyMove(board, row, col, aiPlayer)
      const evalScore = minimax(board, depth - 1, alpha, beta, false, aiPlayer, humanPlayer)
      undoMove(board, row, col)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const { row, col } of moves) {
      applyMove(board, row, col, humanPlayer)
      const evalScore = minimax(board, depth - 1, alpha, beta, true, aiPlayer, humanPlayer)
      undoMove(board, row, col)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

const getHardMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  if (emptyTiles.length === 0) return null

  // First move – take centre
  const totalPieces = board.length * board.length - emptyTiles.length
  if (totalPieces === 0) {
    const mid = Math.floor(board.length / 2)
    return { row: mid, col: mid }
  }

  // Immediate win
  const winMove = getWinningMove(board, aiPlayer, emptyTiles)
  if (winMove) return winMove

  // Block opponent win
  const blockWin = getWinningMove(board, humanPlayer, emptyTiles)
  if (blockWin) return blockWin

  // Iterative deepening up to depth 6 (or as fast as possible)
  const MAX_DEPTH = 6
  let bestMove = null
  let bestScore = -Infinity

  // Generate candidate moves once, sorted by immediate score
  const candidates = getNeighbourMoves(board)
  candidates.sort((a, b) => {
    const sa = scoreMove(board, a.row, a.col, aiPlayer, humanPlayer)
    const sb = scoreMove(board, b.row, b.col, aiPlayer, humanPlayer)
    return sb - sa
  })

  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    let currentBest = null
    let currentBestScore = -Infinity
    let alpha = -Infinity
    let beta = Infinity

    for (const { row, col } of candidates) {
      applyMove(board, row, col, aiPlayer)
      const score = minimax(board, depth - 1, alpha, beta, false, aiPlayer, humanPlayer)
      undoMove(board, row, col)

      if (score > currentBestScore) {
        currentBestScore = score
        currentBest = { row, col }
      }
      alpha = Math.max(alpha, score)
    }

    if (currentBest) {
      bestMove = currentBest
      bestScore = currentBestScore
    }

    // stop early if a forced win is found
    if (bestScore >= 90000) break
  }

  return bestMove || getRandomMove(emptyTiles)
}

// ---------- Public API ----------
const getAIMove = (board, difficulty = 'medium', aiPlayer = 'O', humanPlayer = 'X') => {
  const emptyTiles = getEmptyTiles(board)
  if (!emptyTiles.length) return null

  // Always take a winning move if available
  const winningMove = getWinningMove(board, aiPlayer, emptyTiles)
  if (winningMove) return winningMove

  switch (difficulty) {
    case 'easy':
      return getEasyMove(board, humanPlayer)
    case 'medium':
      return getMediumMove(board, aiPlayer, humanPlayer)
    case 'hard':
      return getHardMove(board, aiPlayer, humanPlayer)
    default:
      return getRandomMove(emptyTiles)
  }
}

module.exports = { getAIMove }
