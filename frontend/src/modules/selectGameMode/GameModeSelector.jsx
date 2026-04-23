import React from 'react';

export default function GameModeSelector({ onSelect }) {
  return (
    <div>
      <h2 className="mode-title">Choose Your Opponent</h2>
      <div className="cards-container">
        {/* AI Card */}
        <div className="selection-card" onClick={() => onSelect('ai')}>
          <div className="card-icon">
            <i className="bi bi-robot"></i>
          </div>
          <div className="card-label">AI</div>
          <div className="card-description">
            Playing against bot with chosen difficulty
          </div>
        </div>

        {/* Human Card */}
        <div className="selection-card" onClick={() => onSelect('human')}>
          <div className="card-icon">
            <i className="bi bi-person-fill"></i>
          </div>
          <div className="card-label">Human</div>
          <div className="card-description">
            Playing against other random players
          </div>
        </div>
      </div>
    </div>
  );
}
