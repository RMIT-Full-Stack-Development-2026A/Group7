const {
  wouldWin,
  isDoubleThree,
  isRealThreat,
  scoreMove,
} = require('../../shared/utils/game.utils')

// Hard AI uses depth-limited minimax with alpha-beta pruning.
// Scoring is purely terminal: a forced AI win returns a large positive value
// (favouring faster wins via depth), a forced opponent win returns the negative,
// and any non-terminal leaf at the depth cutoff returns 0. No heuristic
// position-score blending — the algorithm only "sees" wins and losses inside
// its search horizon, matching the classic minimax formulation.
const MINIMAX_DEPTH = 6
const MAX_CANDIDATES = 10
const NEIGHBOUR_RADIUS = 2
const TERMINAL_WIN = 1_000_000

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

const getWinningMove = (board, player, emptyTiles = getEmptyTiles(board)) => (
  emptyTiles.find(({ row, col }) => wouldWin(board, row, col, player)) || null
)

const countPieces = (board) => {
  let total = 0
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== null) total += 1
    }
  }
  return total
}

// Only consider empty cells near existing stones. This keeps the branching
// factor tractable on a 15x15 board without changing the algorithm: a stone
// played far from any other piece is provably no better than one of these.
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

// Order candidates by adjacent-stone density. This is structural, not a
// position score — it just visits the cells most connected to existing play
// first so alpha-beta can prune sibling branches more aggressively.
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

const orderCandidates = (board, candidates) => (
  candidates
    .map((move) => ({ move, weight: countAdjacentStones(board, move.row, move.col) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_CANDIDATES)
    .map(({ move }) => move)
)

const minimax = (board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer) => {
  const candidates = getCandidateMoves(board)
  if (!candidates.length) {
    return { score: 0, move: null }
  }

  const currentPlayer = isMaximizing ? aiPlayer : humanPlayer

  // If the side to move has an immediate 5-in-a-row, that's a terminal node.
  for (const { row, col } of candidates) {
    if (wouldWin(board, row, col, currentPlayer)) {
      const winValue = isMaximizing ? TERMINAL_WIN + depth : -(TERMINAL_WIN + depth)
      return { score: winValue, move: { row, col } }
    }
  }

  // Reached the search horizon without a forced result — neutral (tie-like) leaf.
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

// Spec 4.2.3: Easy AI must "randomly choose an empty cell immediately adjacent
// to the player's last move". Adjacency = the 8 surrounding cells (king moves).
// We still fall back to any empty cell when the neighbours are all taken or no
// player move exists yet (e.g. AI moves first).
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
  if (adjacentTiles.length) {
    return getRandomMove(adjacentTiles)
  }
  // Edge case: no human move yet or its neighbours are filled — pick any cell.
  return getRandomMove(getEmptyTiles(board))
}

// Medium uses the previous Hard heuristic ladder (one-ply tactical scoring).
const getMediumMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)

  if (countPieces(board) === 0) {
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

// Hard: tactical pre-checks (catch forced moves cheaply) then pure minimax search.
const getHardMove = (board, aiPlayer, humanPlayer) => {
  const emptyTiles = getEmptyTiles(board)
  if (!emptyTiles.length) return null

  if (countPieces(board) === 0) {
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

  // Last-resort fallback if minimax saw no candidates (extremely sparse board).
  const candidates = getCandidateMoves(board)
  if (candidates.length) return candidates[0]
  return getRandomMove(emptyTiles)
}

const getAIMove = (board, difficulty = 'medium', aiPlayer = 'O', humanPlayer = 'X', lastHumanMove = null) => {
  const emptyTiles = getEmptyTiles(board)

  if (!emptyTiles.length) {
    return null
  }

  // Spec note: Easy AI is intentionally limited to random adjacent moves and
  // skips the global winning-move shortcut other difficulties take.
  if (difficulty === 'easy') {
    return getEasyMove(board, humanPlayer, lastHumanMove)
  }

  const winningMove = getWinningMove(board, aiPlayer, emptyTiles)
  if (winningMove) {
    return winningMove
  }

  switch (difficulty) {
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
