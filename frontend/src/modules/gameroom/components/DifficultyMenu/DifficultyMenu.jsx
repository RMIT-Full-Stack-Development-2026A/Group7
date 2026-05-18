import { useState } from 'react';
import { useDifficultyMenu } from '../../hooks/useDifficultyMenu.js';

export function DifficultyMenu({ onSelect, onSelectLocalPlayer }) {
  const { difficultyOptions } = useDifficultyMenu();
  const [isNamingLocalPlayer, setIsNamingLocalPlayer] = useState(false);
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [nameError, setNameError] = useState('');

  const allowLocalPlayer = typeof onSelectLocalPlayer === 'function';

  const handleConfirmLocalPlayer = (event) => {
    event.preventDefault();
    const trimmed = localPlayerName.trim();
    if (!trimmed) {
      setNameError("Please enter the second player's name.");
      return;
    }
    if (trimmed.length > 30) {
      setNameError('Name must be 30 characters or fewer.');
      return;
    }
    setNameError('');
    setLocalPlayerName('');
    setIsNamingLocalPlayer(false);
    onSelectLocalPlayer(trimmed);
  };

  return (
    <div className="difficulty-menu">
      <div className="difficulty-menu-header">Add player</div>

      {allowLocalPlayer ? (
        isNamingLocalPlayer ? (
          <form onSubmit={handleConfirmLocalPlayer} className="difficulty-local-form">
            <label className="difficulty-local-label" htmlFor="local-player-name">
              Second player's name
            </label>
            <input
              id="local-player-name"
              type="text"
              autoFocus
              maxLength={30}
              value={localPlayerName}
              onChange={(event) => {
                setLocalPlayerName(event.target.value);
                if (nameError) setNameError('');
              }}
              className="difficulty-local-input"
              placeholder="e.g. Alex"
            />
            {nameError ? <div className="difficulty-local-error">{nameError}</div> : null}
            <div className="difficulty-local-actions">
              <button type="submit" className="difficulty-local-confirm">Add</button>
              <button
                type="button"
                className="difficulty-local-cancel"
                onClick={() => {
                  setIsNamingLocalPlayer(false);
                  setLocalPlayerName('');
                  setNameError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsNamingLocalPlayer(true)}
            className="difficulty-option"
          >
            <i className="bi bi-person-plus difficulty-icon" style={{ color: '#7aa2ff' }} />
            <span>Player (Local)</span>
          </button>
        )
      ) : null}

      {!isNamingLocalPlayer ? (
        <>
          <div className="difficulty-menu-subheader">Or add an AI</div>
          {difficultyOptions.map((item) => (
            <button key={item.level} onClick={() => onSelect(item.level)} className="difficulty-option">
              <i className={`bi ${item.icon} difficulty-icon`} style={{ color: item.color }} />
              <span>{item.level}</span>
            </button>
          ))}
        </>
      ) : null}
    </div>
  );
}
