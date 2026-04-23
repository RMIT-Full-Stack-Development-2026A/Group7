import React, { useEffect, useState } from 'react';

export default function BoardLoadAnimation() {
  const [filledTiles, setFilledTiles] = useState([]);
  const boardSize = 5;

  useEffect(() => {
    let currentDiagonal = 0;
    const maxDiagonal = (boardSize - 1) * 2;

    const interval = setInterval(() => {
      const newTiles = [];
      for (let i = 0; i <= currentDiagonal; i++) {
        const row = boardSize - 1 - i;
        const col = currentDiagonal - i;
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
          newTiles.push({ row, col });
        }
      }
      setFilledTiles(newTiles);
      
      currentDiagonal = (currentDiagonal + 1) % (maxDiagonal + 2);
      if (currentDiagonal === 0) {
        setTimeout(() => setFilledTiles([]), 200);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-board-wrapper">
        <div className="loading-board">
          {Array.from({ length: boardSize }).map((_, row) => (
            <div key={row} className="loading-row">
              {Array.from({ length: boardSize }).map((_, col) => {
                const isFilled = filledTiles.some(
                  tile => tile.row === row && tile.col === col
                );
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`loading-tile ${isFilled ? 'filled' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="loading-text mt-4">Loading Board...</div>
    </div>
  );
}
