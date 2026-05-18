export function TopBar({ roomSize, roomID, onSetting, onBack }) {
  return (
    <header className="top-bar d-flex align-items-center justify-content-between">
      <button onClick={onBack} className="btn-back d-flex align-items-center gap-2 p-2">
        <span className="top-bar-icon-shell">
          <i className="bi bi-arrow-left" />
        </span>
        <span>Back</span>
      </button>

      <div className="d-flex flex-column align-items-center">
        <div className="room-id-label">
          Room ID: {roomID}
        </div>
        <div className="room-info-badge">{roomSize} Players</div>
      </div>

      <button onClick={onSetting} className="btn-settings d-flex align-items-center justify-content-center">
        <span className="top-bar-icon-shell top-bar-icon-shell-settings">
          <i className="bi bi-gear-fill" />
        </span>
      </button>
    </header>
  );
}
