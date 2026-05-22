// AI move selection for each difficulty tier. Pure functions — no React.
import {
  getEmptyTiles,
  isDoubleThree,
  isRealThreat,
  scoreMove,
  wouldWin,
} from './game.utils.js'

// Hard uses depth-limited minimax with alpha-beta pruning. Scoring is purely
// terminal — a forced AI win scores positive, a forced opponent win negative,
// and non-terminal leaves at the depth cutoff score 0. No heuristic position
// blending.
const MINIMAX_DEPTH = 6
const MAX_CANDIDATES = 10
const NEIGHBOUR_RADIUS = 2
const TERMINAL_WIN = 1_000_000

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

// Spec 4.2.3: Easy AI must "randomly choose an empty cell immediately adjacent
// to the player's last move". Adjacency = the 8 surrounding cells (king moves).
const getAdjacentEmptyTiles = (board, lastMove) => {
  if (!lastMove
    || !Number.isInteger(lastMove.row)
    || !Number.isInteger(lastMove.col)
  ) {
    return []
  }
  const size = board.length
  const tiles = []
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue
      const row = lastMove.row + dr
      const col = lastMove.col + dc
      if (row < 0 || row >= size || col < 0 || col >= size) continue
      if (board[row][col] === null) tiles.push({ row, col })
    }
  }
  return tiles
}

const getEasyMove = (board, _humanPlayer, lastHumanMove = null) => {
  const adjacentTiles = getAdjacentEmptyTiles(board, lastHumanMove)
  if (adjacentTiles.length) return getRandomMove(adjacentTiles)
  // Edge case: no human move yet or its neighbours are filled — random fallback.
  return getRandomMove(getEmptyTiles(board))
}

// Medium uses the previous Hard heuristic ladder (one-ply tactical scoring).
const getMediumMove = (board, aiPlayer, humanPlayer) => {
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

// Only consider empty cells near existing stones — keeps branching tractable.
const getCandidateMoves = (board) => {
  const size = board.length
  const seen = new Set()
  const candidates = []

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (board[row][col] === null) continue

      for (let dr = -NEIGHBOUR_RADIUS; dr <= NEIGHBOUR_RADIUS; dr += 1) {
        for (let dc = -NEIGHBOUR_RADIUS; dc <= NEIGHBOUR_RADIUS; dc += 1) {
          const nr = row + dr
          const nc = col + dc
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue
          if (board[nr][nc] !== null) continue
          const key = nr * size + nc
          if (seen.has(key)) continue
          seen.add(key)
          candidates.push({ row: nr, col: nc })
        }
      }
    }
  }

  return candidates
}

// Order candidates by adjacent-stone density (structural, not a position score).
const countAdjacentStones = (board, row, col) => {
  const size = board.length
  let count = 0
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue
      const nr = row + dr
      const nc = col + dc
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue
      if (board[nr][nc] !== null) count += 1
    }
  }
  return count
}

const orderCandidates = (board, candidates) =>
  candidates
    .map((move) => ({ move, weight: countAdjacentStones(board, move.row, move.col) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_CANDIDATES)
    .map(({ move }) => move)

const minimax = (board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer) => {
  const candidates = getCandidateMoves(board)
  if (!candidates.length) {
    return { score: 0, move: null }
  }

  const currentPlayer = isMaximizing ? aiPlayer : humanPlayer

  for (const { row, col } of candidates) {
    if (wouldWin(board, row, col, currentPlayer)) {
      const winValue = isMaximizing ? TERMINAL_WIN + depth : -(TERMINAL_WIN + depth)
      return { score: winValue, move: { row, col } }
    }
  }

  if (depth === 0) {
    return { score: 0, move: null }
  }

  const ordered = orderCandidates(board, candidates)
  let bestMove = ordered[0] || null
  let bestScore = isMaximizing ? -Infinity : Infinity
  let a = alpha
  let b = beta

  for (const { row, col } of ordered) {
    board[row][col] = currentPlayer

    let result
    if (wouldWin(board, row, col, currentPlayer)) {
      result = { score: isMaximizing ? TERMINAL_WIN + depth : -(TERMINAL_WIN + depth) }
    } else {
      result = minimax(board, depth - 1, a, b, !isMaximizing, aiPlayer, humanPlayer)
    }

    board[row][col] = null

    if (isMaximizing) {
      if (result.score > bestScore) {
        bestScore = result.score
        bestMove = { row, col }
      }
      if (bestScore > a) a = bestScore
    } else {
      if (result.score < bestScore) {
        bestScore = result.score
        bestMove = { row, col }
      }
      if (bestScore < b) b = bestScore
    }

    if (b <= a) break
  }

  return { score: bestScore, move: bestMove }
}

// Hard: tactical pre-checks (catch forced moves cheaply), then pure minimax.
const getHardMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  if (!emptyTiles.length) return null

  if (countPieces(board) === 0) {
    const center = Math.floor(board.length / 2)
    return { row: center, col: center }
  }

  const tacticalLadder = [
    ({ row, col }) => wouldWin(board, row, col, aiPlayer),
    ({ row, col }) => wouldWin(board, row, col, humanPlayer),
    ({ row, col }) => isRealThreat(board, row, col, aiPlayer, 4),
    ({ row, col }) => isRealThreat(board, row, col, humanPlayer, 4),
    ({ row, col }) => isDoubleThree(board, row, col, humanPlayer),
    ({ row, col }) => isDoubleThree(board, row, col, aiPlayer),
    ({ row, col }) => isRealThreat(board, row, col, humanPlayer, 3),
    ({ row, col }) => isRealThreat(board, row, col, aiPlayer, 3),
  ]
  for (const predicate of tacticalLadder) {
    const match = findFirstMatch(emptyTiles, predicate)
    if (match) return match
  }

  const workingBoard = board.map((boardRow) => [...boardRow])
  const { move } = minimax(
    workingBoard,
    MINIMAX_DEPTH,
    -Infinity,
    Infinity,
    true,
    aiPlayer,
    humanPlayer,
  )

  if (move) return move

  const candidates = getCandidateMoves(board)
  if (candidates.length) return candidates[0]
  return getRandomMove(emptyTiles)
}

export function getAIMove(board, difficulty = 'medium', aiPlayer = 'O', humanPlayer = 'X', lastHumanMove = null) {
  const emptyTiles = getEmptyTiles(board)
  if (!emptyTiles.length) return null

  // Spec note: Easy AI is intentionally limited to random adjacent moves and
  // skips the global winning-move shortcut other difficulties take.
  if (difficulty === 'easy') return getEasyMove(board, humanPlayer, lastHumanMove)

  const winningMove = getWinningMove(board, aiPlayer, emptyTiles)
  if (winningMove) return winningMove

  switch (difficulty) {
    case 'medium': return getMediumMove(board, aiPlayer, humanPlayer)
    case 'hard': return getHardMove(board, aiPlayer, humanPlayer)
    default: return getRandomMove(emptyTiles)
  }
}
