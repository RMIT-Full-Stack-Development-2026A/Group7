import React from 'react';

export default function DifficultySelector({ onSelect }) {
  const difficulties = [
    {
      level: 'easy',
      label: 'Easy',
      icon: 'bi-emoji-smile',
      className: 'difficulty-easy',
      description: 'Simple bot moves, perfect for beginners learning the game'
    },
    {
      level: 'normal',
      label: 'Normal',
      icon: 'bi-emoji-neutral',
      className: 'difficulty-normal',
      description: 'Better bot logic with moderate challenge for intermediate players'
    },
    {
      level: 'hard',
      label: 'Hard',
      icon: 'bi-emoji-frown',
      className: 'difficulty-hard',
      description: 'Strategic bot with real challenge for experienced players'
    }
  ];

  return (
    <div>
      <h2 className="mode-title">Choose Difficulty</h2>
      <div className="cards-container">
        {difficulties.map(({ level, label, icon, className, description }) => (
          <div
            key={level}
            className={`selection-card difficulty-card ${className}`}
            onClick={() => onSelect(level)}
          >
            <div className="card-icon">
              <i className={`bi ${icon}`}></i>
            </div>
            <div className="card-label">{label}</div>
            <div className="card-description difficulty-description">{description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
