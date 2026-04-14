import React, { useEffect, useState } from 'react';
import './GameSetup.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const MARKER_OPTIONS_BY_PLAYERS = {
  2: [
    { id: 'X-O', label: 'X - O' },
    { id: 'Circle-Star', label: '\u25cf - \u2605' },
    { id: 'Square-Triangle', label: '\u25a0 - \u25b2' },
    { id: 'Moon-Sun', label: '\u263e - \u2600' },
    { id: 'Heart-Spade', label: '\u2665 - \u2660' },
    { id: 'Diamond-Club', label: '\u2666 - \u2663' },
  ],
  3: [
    { id: 'X-O-Triangle', label: 'X - O - \u25b2' },
    { id: 'Circle-Star-Square', label: '\u25cf - \u2605 - \u25a0' },
    { id: 'Moon-Sun-Cloud', label: '\u263e - \u2600 - \u2601' },
    { id: 'Heart-Spade-Diamond', label: '\u2665 - \u2660 - \u2666' },
    { id: 'Club-Diamond-Star', label: '\u2663 - \u2666 - \u2605' },
    { id: 'Triangle-Square-Circle', label: '\u25b2 - \u25a0 - \u25cf' },
  ],
  4: [
    { id: 'X-O-Triangle-Square', label: 'X - O - \u25b2 - \u25a0' },
    { id: 'Circle-Star-Square-Triangle', label: '\u25cf - \u2605 - \u25a0 - \u25b2' },
    { id: 'Moon-Sun-Cloud-Lightning', label: '\u263e - \u2600 - \u2601 - \u26a1' },
    { id: 'Heart-Spade-Diamond-Club', label: '\u2665 - \u2660 - \u2666 - \u2663' },
    { id: 'Star-Circle-Heart-Diamond', label: '\u2605 - \u25cf - \u2665 - \u2666' },
    { id: 'Triangle-Square-Club-Spade', label: '\u25b2 - \u25a0 - \u2663 - \u2660' },
  ],
};

const GameSetup = ({ onCreateRoom }) => {
  const [players, setPlayers] = useState(2);
  const [boardStyle, setBoardStyle] = useState('Classic');
  const [boardSize, setBoardSize] = useState('10x10');
  const [marker, setMarker] = useState(MARKER_OPTIONS_BY_PLAYERS[2][0].id);
  const [timeToThink, setTimeToThink] = useState(60);
  const [roomName, setRoomName] = useState('Game Room');
  const [isLoading, setIsLoading] = useState(false);

  const boardStyles = ['Classic', 'Modern', 'Minimal'];
  const boardSizes = ['10x10', '15x15'];
  const markerOptions = MARKER_OPTIONS_BY_PLAYERS[players];

  const timeOptions = [60, 75, 90, 105, 120]; // 60s, 75s, 90s, 105s, 120s

  useEffect(() => {
    const markerStillValid = markerOptions.some((option) => option.id === marker);

    if (!markerStillValid) {
      setMarker(markerOptions[0].id);
    }
  }, [marker, markerOptions]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec === 0 ? `${minutes}:00` : `${minutes}:${sec}`;
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const roomData = {
        roomName,
        size: players,
        boardStyle,
        boardSize,
        marker,
        timeToThink,
        userId: 'anonymous_user',
      };

      const response = await fetch(`${API_BASE_URL}/api/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || 'Failed to create room');
      }

      const result = await response.json();
      const createdRoom = result.data;

      onCreateRoom({
        ...createdRoom,
        gameSettings: {
          boardStyle,
          boardSize,
          marker,
          timeToThink,
        },
      });
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-setup-container">
      <div className="setup-card">
        <h1 className="setup-title">Create Your Game Room</h1>

        <div className="setup-section">
          <label>Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="setup-input"
          />
        </div>

        <div className="setup-section">
          <label>Number of Players</label>
          <div className="options-grid">
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                className={`option-btn ${players === num ? 'active' : ''}`}
                onClick={() => setPlayers(num)}
              >
                {num} Players
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <label>Board Style</label>
          <div className="options-grid">
            {boardStyles.map((style) => (
              <button
                key={style}
                className={`option-btn ${boardStyle === style ? 'active' : ''}`}
                onClick={() => setBoardStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <label>Board Size</label>
          <div className="options-grid">
            {boardSizes.map((size) => (
              <button
                key={size}
                className={`option-btn ${boardSize === size ? 'active' : ''}`}
                onClick={() => setBoardSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <label>Game Marker</label>
          <div className="marker-grid">
            {markerOptions.map((option) => (
              <button
                key={option.id}
                className={`marker-btn ${marker === option.id ? 'active' : ''}`}
                onClick={() => setMarker(option.id)}
                title={option.label}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <label>Time to Think</label>
          <div className="time-slider-container">
            <input
              type="range"
              min="60"
              max="120"
              step="15"
              value={timeToThink}
              onChange={(e) => setTimeToThink(parseInt(e.target.value, 10))}
              className="time-slider"
            />
            <span className="time-display">{formatTime(timeToThink)}</span>
          </div>
          <div className="time-buttons">
            {timeOptions.map((time) => (
              <button
                key={time}
                className={`time-btn ${timeToThink === time ? 'active' : ''}`}
                onClick={() => setTimeToThink(time)}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </div>

        <button
          className="create-room-btn"
          onClick={handleCreateRoom}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Room...' : 'Create Room'}
        </button>
      </div>
    </div>
  );
};

export default GameSetup;
