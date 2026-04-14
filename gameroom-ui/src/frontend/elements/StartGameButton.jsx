export function StartGameButton({ isHost, onClick, disabled }) {
  return (
    <div className="start-game-btn-wrapper">
      <button onClick={onClick} disabled={disabled} className={`btn-start-game ${isHost ? 'host' : 'not-host'}`}>
        <i className="bi bi-play-fill" style={{ fontSize: '1.4rem' }} />
        <span>{isHost ? 'Start Game' : 'Waiting for host'}</span>
      </button>
    </div>
  );
}
