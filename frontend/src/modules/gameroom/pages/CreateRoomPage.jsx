import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/RoomSettingsForm/RoomSettingsForm.css';
import { useRoomSettingsForm } from '../hooks/useRoomSettingsForm.js';
import ROUTES from '../../../router/routes.config.js';
import { applyThemeToDocument, loadGameSettings } from '../../../shared/utils/gameSettings.js';

const CreateRoomPage = ({ onCreateRoom }) => {
  const navigate = useNavigate();
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      const savedSettings = loadGameSettings();
      applyThemeToDocument(savedSettings);
      const documentTheme = document.documentElement.getAttribute('data-app-theme');
      setIsLightTheme(documentTheme === 'light' || savedSettings.darkMode === false);
    };

    syncTheme();

    window.addEventListener('focus', syncTheme);
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('focus', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const handleRoomCreated = (room) => {
    if (typeof onCreateRoom === 'function') {
      onCreateRoom(room);
      return;
    }

    navigate('/gameroom', {
      state: { createdRoom: room, returnTo: ROUTES.CREATE_ROOM },
    });
  };

  const {
    players,
    boardStyle,
    boardSize,
    marker,
    timeToThink,
    roomName,
    isLoading,
    hostPosition,
    showHostPositionPicker,
    hostPositionOptions,
    boardStyles,
    boardSizes,
    markerOptions,
    timeOptions,
    timerMinSeconds,
    timerMaxSeconds,
    timerStepSeconds,
    setPlayers,
    setBoardStyle,
    setBoardSize,
    setMarker,
    setTimeToThink,
    setRoomName,
    setHostPosition,
    formatTime,
    handleCreateRoom,
  } = useRoomSettingsForm(handleRoomCreated);

  const positionLabel = (position) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  return (
    <div className={`game-setup-container ${isLightTheme ? 'theme-light' : 'theme-dark'}`}>
      <button
        type="button"
        className="setup-back-btn"
        onClick={() => navigate(ROUTES.MAIN_MENU)}
      >
        <span className="setup-back-icon">←</span>
        <span>Back to Main Menu</span>
      </button>

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
            {[2, 3].map((num) => (
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

        {showHostPositionPicker && (
          <div className="setup-section">
            <label>Host Position (you go on this turn)</label>
            <div className="options-grid">
              {hostPositionOptions.map((position) => (
                <button
                  key={position}
                  className={`option-btn ${hostPosition === position ? 'active' : ''}`}
                  onClick={() => setHostPosition(position)}
                >
                  {positionLabel(position)}
                </button>
              ))}
            </div>
          </div>
        )}

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
          <label>Maximum Timer Per Player (Chess-Clock)</label>
          <div className="time-slider-container">
            <input
              type="range"
              min={timerMinSeconds}
              max={timerMaxSeconds}
              step={timerStepSeconds}
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

export default CreateRoomPage;
