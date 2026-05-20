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

// ---------- Threat-based forced win search (VCT) ----------
// Tries to find a sequence of threats that leads to a forced win.
// Returns the first move of that sequence, or null.
const findForcedWin = (board, aiPlayer, humanPlayer, maxDepth = 8) => {
  // For each possible move by AI that creates a threat (double-three or open-four),
  // check if after the opponent's only defense(s) the AI can continue with threats
  // until a five is unavoidable.

  const emptyTiles = getEmptyTiles(board)

  // Helper: check if a move is a threat that the opponent must block
  const isThreatMove = (row, col, player) =>
    wouldWin(board, row, col, player) ||
    isRealThreat(board, row, col, player, 4) ||
    isDoubleThree(board, row, col, player)

  // Depth-limited threat search (returns true if forced win exists)
  const threatSearch = (currentBoard, depth, isAITurn) => {
    if (depth <= 0) return false

    const player = isAITurn ? aiPlayer : humanPlayer
    const opp = isAITurn ? humanPlayer : aiPlayer
    const empties = getEmptyTiles(currentBoard)

    // Immediate win for current player → good for AI, bad for human
    const winMove = getWinningMove(currentBoard, player, empties)
    if (winMove) return isAITurn // if it's AI's turn and win exists, true; if human's turn, false

    // If no win, generate all moves
    if (isAITurn) {
      // AI looks for a threat that leads to a forced continuation
      const threats = empties.filter(({ row, col }) => isThreatMove(row, col, aiPlayer))
      // Also consider all neighbour moves if few threats (avoid missing subtle wins)
      const candidates = threats.length >= 1 ? threats : getNeighbourMoves(currentBoard, 2)
      for (const { row, col } of candidates) {
        applyMove(currentBoard, row, col, aiPlayer)
        // opponent must respond
        const forced = threatSearch(currentBoard, depth - 1, false)
        undoMove(currentBoard, row, col)
        if (forced) return true
      }
      return false
    } else {
      // Human's turn: try all moves; AI hopes any response still leads to a win
      const moves = getNeighbourMoves(currentBoard, 2)
      for (const { row, col } of moves) {
        applyMove(currentBoard, row, col, humanPlayer)
        const aiCanWin = threatSearch(currentBoard, depth - 1, true)
        undoMove(currentBoard, row, col)
        if (!aiCanWin) return false // if human can find a move that breaks the forced win
      }
      return true // all human replies still allow AI to win
    }
  }

  // Try each of AI's initial threat moves to start a forced sequence
  const initialCandidates = getNeighbourMoves(board, 2).filter(({ row, col }) =>
    isThreatMove(row, col, aiPlayer)
  )
  // If no threats, give up and return null
  if (!initialCandidates.length) return null

  for (const { row, col } of initialCandidates) {
    applyMove(board, row, col, aiPlayer)
    if (threatSearch(board, maxDepth - 1, false)) {
      undoMove(board, row, col)
      return { row, col }
    }
    undoMove(board, row, col)
  }
  return null
}

// ---------- Improved board evaluation (pattern‑based) ----------
const evaluateBoardState = (board, aiPlayer, humanPlayer) => {
  // Score each empty cell using evaluatePosition, but only those near stones
  const positions = getNeighbourMoves(board, 2)
  let aiSum = 0, humanSum = 0
  for (const { row, col } of positions) {
    aiSum += evaluatePosition(board, row, col, aiPlayer)
    humanSum += evaluatePosition(board, row, col, humanPlayer)
  }
  return aiSum - humanSum
}

// ---------- Minimax with quiescence and depth‑6 ----------
const minimax = (board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer, allowQuiesce = true) => {
  const emptyTiles = getEmptyTiles(board)
  if (emptyTiles.length === 0) return 0

  // Immediate win
  if (isMaximizing) {
    if (getWinningMove(board, aiPlayer, emptyTiles)) return 100000 + depth
  } else {
    if (getWinningMove(board, humanPlayer, emptyTiles)) return -100000 - depth
  }

  // Quiescence search: if depth exhausted but board is "hot", extend
  if (depth === 0 && allowQuiesce) {
    const hot =
      getWinningMove(board, aiPlayer, emptyTiles) ||
      getWinningMove(board, humanPlayer, emptyTiles) ||
      emptyTiles.some(({ row, col }) => isDoubleThree(board, row, col, aiPlayer) || isDoubleThree(board, row, col, humanPlayer))
    if (hot) {
      return minimax(board, 1, alpha, beta, isMaximizing, aiPlayer, humanPlayer, false)
    }
    return evaluateBoardState(board, aiPlayer, humanPlayer)
  }

  if (depth === 0) {
    return evaluateBoardState(board, aiPlayer, humanPlayer)
  }

  let moves = getNeighbourMoves(board, 2)
  // Order moves by a 1‑ply evaluation (score after making the move)
  moves.sort((a, b) => {
    const player = isMaximizing ? aiPlayer : humanPlayer
    applyMove(board, a.row, a.col, player)
    const scoreA = evaluateBoardState(board, aiPlayer, humanPlayer)
    undoMove(board, a.row, a.col)

    applyMove(board, b.row, b.col, player)
    const scoreB = evaluateBoardState(board, aiPlayer, humanPlayer)
    undoMove(board, b.row, b.col)

    return isMaximizing ? scoreB - scoreA : scoreA - scoreB
  })
  if (moves.length > 10) moves = moves.slice(0, 10)

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

// ---------- Final hard move: VCT + deep minimax ----------
const getHardMove = (board, aiPlayer, humanPlayer) => {
  try {
    const emptyTiles = getEmptyTiles(board)
    if (!emptyTiles.length) return null

    // First move – centre
    const totalPieces = board.length * board.length - emptyTiles.length
    if (totalPieces === 0) {
      const mid = Math.floor(board.length / 2)
      return { row: mid, col: mid }
    }

    // 1) Win immediately
    const winMove = getWinningMove(board, aiPlayer, emptyTiles)
    if (winMove) return winMove

    // 2) Block opponent win
    const blockWin = getWinningMove(board, humanPlayer, emptyTiles)
    if (blockWin) return blockWin

    // 3) Forced win sequence (VCT) – completely deterministic
    const forcedWin = findForcedWin(board, aiPlayer, humanPlayer)
    if (forcedWin) return forcedWin

    // 4) Block opponent’s forced win if they have one
    const forcedLoss = findForcedWin(board, humanPlayer, aiPlayer)
    if (forcedLoss) return forcedLoss // this is the defensive move

    // 5) Block open fours and double‑threes to stay safe
    for (const { row, col } of emptyTiles) {
      if (isRealThreat(board, row, col, humanPlayer, 4)) return { row, col }
    }
    for (const { row, col } of emptyTiles) {
      if (isDoubleThree(board, row, col, humanPlayer)) return { row, col }
    }

    // 6) Build own double‑threes offensively
    for (const { row, col } of emptyTiles) {
      if (isDoubleThree(board, row, col, aiPlayer)) return { row, col }
    }

    // 7) Deep minimax (depth 6) with careful ordering
    const candidates = getNeighbourMoves(board, 2)
    candidates.sort((a, b) => {
      const scoreA = evaluatePosition(board, a.row, a.col, aiPlayer)
      const scoreB = evaluatePosition(board, b.row, b.col, aiPlayer)
      return scoreB - scoreA
    })
    if (candidates.length > 10) candidates.length = 10

    const MAX_DEPTH = 6
    let bestMove = null
    let bestScore = -Infinity

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
      if (bestScore >= 90000) break // forced win already found
    }

    return bestMove || getRandomMove(emptyTiles)   // safe fallback (should never trigger)

  } catch (error) {
    console.error('Hard AI error – falling back to medium:', error)
    return getMediumMove(board, aiPlayer, humanPlayer)
  }
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