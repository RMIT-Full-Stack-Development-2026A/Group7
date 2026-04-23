import React, { useState } from 'react';

export default function BoardSizeSelector({ onSelect }) {
  const [selectedSize, setSelectedSize] = useState(null);

  const boardSizes = [
    { size: 10, label: '10 x 10' },
    { size: 15, label: '15 x 15' }
  ];

  const handleSelect = (size) => {
    setSelectedSize(size);
    onSelect(size);
  };

  const renderMiniBoard = (size) => {
    const cellSize = size <= 5 ? '12px' : size <= 10 ? '8px' : '6px';
    return (
      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSize})`,
          gridTemplateRows: `repeat(${size}, ${cellSize})`
        }}
      >
        {Array.from({ length: size * size }).map((_, idx) => (
          <div key={idx} className="board-cell"></div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="mode-title">Choose Board Size</h2>
      <div className="cards-container">
        {boardSizes.map(({ size, label }) => (
          <div
            key={size}
            className={`selection-card board-card ${selectedSize === size ? 'selected' : ''}`}
            onClick={() => handleSelect(size)}
          >
            {renderMiniBoard(size)}
            <div className="board-size-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
