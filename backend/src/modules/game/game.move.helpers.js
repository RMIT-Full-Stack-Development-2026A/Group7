// Pure helpers for game move logic. No external state, no DB access.
const crypto = require('crypto')

const generateGameId = () => {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `GAME_${timestamp}_${random}`
}

const isValidMove = (row, col, boardSize) =>
  row >= 0 && row < boardSize && col >= 0 && col < boardSize

const isEmptyTile = (board, row, col) => board[row][col] === null

const getBoardStateFromMoves = (moves, boardSize) => {
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  for (const move of moves) {
    board[move.row][move.col] = move.player
  }
  return board
}

const WIN_DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
]

const getWinningTilesFromBoard = (board, row, col, player) => {
  const size = board.length
  for (const { dr, dc } of WIN_DIRECTIONS) {
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
    if (count >= 5) return tiles
  }
  return []
}

module.exports = {
  generateGameId,
  isValidMove,
  isEmptyTile,
  getBoardStateFromMoves,
  getWinningTilesFromBoard,
}
