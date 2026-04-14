export function TopBar({ roomSize, roomID, onSetting, onBack }) {
  return (
    <header className="top-bar d-flex align-items-center justify-content-between">
      <button onClick={onBack} className="btn-back d-flex align-items-center gap-2 p-2">
        <i className="bi bi-arrow-left" />
        <span>Back</span>
      </button>

      <div className="d-flex flex-column align-items-center">
        <div style={{ fontSize: '1.1rem', color: '#9ca3af', marginBottom: '6px' }}>
          Room ID: {roomID}
        </div>
        <div className="room-info-badge">{roomSize} Players</div>
      </div>

      <button onClick={onSetting} className="btn-settings d-flex align-items-center justify-content-center">
        <i className="bi bi-gear" />
      </button>
    </header>
  );
}
