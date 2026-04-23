import React from 'react';

export default function PlayerDisplay({ player, isOpponent }) {
  return (
    <div className={`player-display ${isOpponent ? 'opponent' : 'current-player'}`}>
      <div className="d-flex align-items-center gap-3">
        <img 
          src={player.avatar} 
          alt={player.name}
          className="player-avatar"
        />
        <div className="player-info">
          <div className="player-name">{player.name}</div>
          <div className="player-rank">({player.rank})</div>
        </div>
      </div>
    </div>
  );
}
