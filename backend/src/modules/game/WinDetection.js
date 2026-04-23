// backend/utils/winDetection.js
const directions = [
  { dr: 0, dc: 1 },  // horizontal right
  { dr: 1, dc: 0 },  // vertical down
  { dr: 1, dc: 1 },  // diagonal down-right
  { dr: 1, dc: -1 }  // diagonal down-left
];

/**
 * Check if a move creates a win
 * @param {Array} board - 2D array representing the game board
 * @param {number} row - Row of the move
 * @param {number} col - Column of the move
 * @param {string} player - 'X' or 'O'
 * @param {number} winLength - Number needed to win (default 5)
 * @returns {boolean}
 */
const checkWinLength = (board, row, col, player, winLength = 5) => {
  const size = board.length;
  
  for (const { dr, dc } of directions) {
    let count = 1;
    
    // Count in positive direction
    for (let step = 1; step < winLength; step++) {
      const newRow = row + dr * step;
      const newCol = col + dc * step;
      
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break;
      if (board[newRow][newCol] === player) count++;
      else break;
    }
    
    // Count in negative direction
    for (let step = 1; step < winLength; step++) {
      const newRow = row - dr * step;
      const newCol = col - dc * step;
      
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break;
      if (board[newRow][newCol] === player) count++;
      else break;
    }
    
    if (count >= winLength) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if a move wins the game
 * @param {Array} board - 2D array representing the game board
 * @param {number} row - Row of the move
 * @param {number} col - Column of the move
 * @param {string} player - 'X' or 'O'
 * @returns {boolean}
 */
const checkWin = (board, row, col, player) => {
  return checkWinLength(board, row, col, player, 5);
};

/**
 * Get all winning tiles (for replay/result)
 * @param {Array} board - 2D array representing the game board
 * @param {number} row - Row of the move
 * @param {number} col - Column of the move
 * @param {string} player - 'X' or 'O'
 * @returns {Array} Array of {row, col} objects
 */
const getWinningTiles = (board, row, col, player) => {
  const size = board.length;
  
  for (const { dr, dc } of directions) {
    const tiles = [{ row, col }];
    let count = 1;
    
    // Positive direction
    for (let step = 1; step <= 4; step++) {
      const newRow = row + dr * step;
      const newCol = col + dc * step;
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break;
      if (board[newRow][newCol] === player) {
        tiles.push({ row: newRow, col: newCol });
        count++;
      } else break;
    }
    
    // Negative direction
    for (let step = 1; step <= 4; step++) {
      const newRow = row - dr * step;
      const newCol = col - dc * step;
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) break;
      if (board[newRow][newCol] === player) {
        tiles.push({ row: newRow, col: newCol });
        count++;
      } else break;
    }
    
    if (count >= 5) {
      return tiles;
    }
  }
  
  return [];
};

module.exports = {
  directions,
  checkWinLength,
  checkWin,
  getWinningTiles
};