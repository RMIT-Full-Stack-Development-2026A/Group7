export function StartGameButton({ isHost, onClick, disabled, title }) {
  return (
    <div className="start-game-btn-wrapper">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`btn-start-game ${isHost ? 'host' : 'not-host'}`}
      >
        <i className="bi bi-play-fill btn-start-game-icon" />
        <span>{isHost ? 'Start Game' : 'Waiting for host'}</span>
      </button>
    </div>
  );
}
