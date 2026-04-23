export const directions = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
]

export function checkWinLength(board, row, col, player, winLength = 5) {
  const size = board.length

  for (const { dr, dc } of directions) {
    let count = 1

    for (let step = 1; step < winLength; step += 1) {
      const newRow = row + dr * step
      const newCol = col + dc * step
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break
      if (board[newRow][newCol] !== player) break
      count += 1
    }

    for (let step = 1; step < winLength; step += 1) {
      const newRow = row - dr * step
      const newCol = col - dc * step
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break
      if (board[newRow][newCol] !== player) break
      count += 1
    }

    if (count >= winLength) {
      return true
    }
  }

  return false
}

export const checkWin = (board, row, col, player) => checkWinLength(board, row, col, player, 5)

export function wouldWin(board, row, col, player) {
  const testBoard = board.map((boardRow) => [...boardRow])
  testBoard[row][col] = player
  return checkWin(testBoard, row, col, player)
}

export function isRealThreat(board, row, col, player, targetLength = 3) {
  const testBoard = board.map((boardRow) => [...boardRow])
  testBoard[row][col] = player

  for (const { dr, dc } of directions) {
    let count = 1
    let hasOpenEnd = false

    let step = 1
    while (step <= 4) {
      const newRow = row + dr * step
      const newCol = col + dc * step
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board.length) break

      if (testBoard[newRow][newCol] === player) {
        count += 1
        step += 1
        continue
      }

      if (testBoard[newRow][newCol] === null) hasOpenEnd = true
      break
    }

    step = 1
    while (step <= 4) {
      const newRow = row - dr * step
      const newCol = col - dc * step
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board.length) break

      if (testBoard[newRow][newCol] === player) {
        count += 1
        step += 1
        continue
      }

      if (testBoard[newRow][newCol] === null) hasOpenEnd = true
      break
    }

    if (count >= targetLength && (targetLength !== 4 || hasOpenEnd)) {
      return true
    }
  }

  return false
}

export function isDoubleThree(board, row, col, player) {
  const testBoard = board.map((boardRow) => [...boardRow])
  testBoard[row][col] = player

  let threatCount = 0

  for (const { dr, dc } of directions) {
    let count = 1

    for (let step = 1; step <= 4; step += 1) {
      const newRow = row + dr * step
      const newCol = col + dc * step
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board.length) break
      if (testBoard[newRow][newCol] !== player) break
      count += 1
    }

    for (let step = 1; step <= 4; step += 1) {
      const newRow = row - dr * step
      const newCol = col - dc * step
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board.length) break
      if (testBoard[newRow][newCol] !== player) break
      count += 1
    }

    if (count >= 3) {
      threatCount += 1
    }

    if (threatCount >= 2) {
      return true
    }
  }

  return false
}

export function evaluatePosition(board, row, col, player) {
  let totalScore = 0

  for (const { dr, dc } of directions) {
    let count = 1
    let openEnds = 0
    let blockedEnds = 0

    let step = 1
    while (step <= 4) {
      const newRow = row + dr * step
      const newCol = col + dc * step

      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board.length) {
        blockedEnds += 1
        break
      }

      if (board[newRow][newCol] === player) {
        count += 1
        step += 1
        continue
      }

      if (board[newRow][newCol] === null) openEnds += 1
      else blockedEnds += 1
      break
    }

    step = 1
    while (step <= 4) {
      const newRow = row - dr * step
      const newCol = col - dc * step

      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board.length) {
        blockedEnds += 1
        break
      }

      if (board[newRow][newCol] === player) {
        count += 1
        step += 1
        continue
      }

      if (board[newRow][newCol] === null) openEnds += 1
      else blockedEnds += 1
      break
    }

    if (count >= 5) totalScore += 1000000
    else if (count === 4 && openEnds >= 1) totalScore += 100000
    else if (count === 4) totalScore += 10000
    else if (count === 3 && openEnds >= 2) totalScore += 10000
    else if (count === 3 && openEnds >= 1) totalScore += 1000
    else if (count === 2 && openEnds >= 2) totalScore += 100
    else if (count === 2 && openEnds >= 1) totalScore += 10
    else if (count === 1 && openEnds >= 2 && blockedEnds === 0) totalScore += 1
  }

  return totalScore
}

export function scoreMove(board, row, col, aiPlayer, humanPlayer) {
  const offensiveScore = evaluatePosition(board, row, col, aiPlayer)
  const defensiveScore = evaluatePosition(board, row, col, humanPlayer) * 0.9
  return offensiveScore + defensiveScore
}

export function getEmptyTiles(board) {
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

export function isBoardFull(board) {
  return board.every((boardRow) => boardRow.every((cell) => cell !== null))
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

export function getAIMove(board, difficulty = 'medium', aiPlayer = 'O', humanPlayer = 'X') {
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

export function getWinningTiles(board, row, col, player) {
  const size = board.length

  for (const { dr, dc } of directions) {
    const tiles = [{ row, col }]
    let count = 1

    for (let step = 1; step <= 4; step += 1) {
      const newRow = row + dr * step
      const newCol = col + dc * step
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break
      if (board[newRow][newCol] !== player) break
      tiles.push({ row: newRow, col: newCol })
      count += 1
    }

    for (let step = 1; step <= 4; step += 1) {
      const newRow = row - dr * step
      const newCol = col - dc * step
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break
      if (board[newRow][newCol] !== player) break
      tiles.push({ row: newRow, col: newCol })
      count += 1
    }

    if (count >= 5) {
      return tiles
    }
  }

  return []
}
