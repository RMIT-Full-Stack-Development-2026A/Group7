const directions = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
]

const checkWinLength = (board, row, col, player, winLength = 5) => {
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

const checkWin = (board, row, col, player) => checkWinLength(board, row, col, player, 5)

const wouldWin = (board, row, col, player) => {
  const testBoard = board.map((boardRow) => [...boardRow])
  testBoard[row][col] = player
  return checkWinLength(testBoard, row, col, player, 5)
}

const isRealThreat = (board, row, col, player, targetLength = 3) => {
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

const isDoubleThree = (board, row, col, player) => {
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

const evaluatePosition = (board, row, col, player) => {
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

const scoreMove = (board, row, col, aiPlayer, humanPlayer) => {
  const offensiveScore = evaluatePosition(board, row, col, aiPlayer)
  const defensiveScore = evaluatePosition(board, row, col, humanPlayer) * 0.9
  return offensiveScore + defensiveScore
}

const getWinningTiles = (board, row, col, player) => {
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

module.exports = {
  directions,
  checkWin,
  checkWinLength,
  wouldWin,
  isRealThreat,
  isDoubleThree,
  evaluatePosition,
  scoreMove,
  getWinningTiles,
}
