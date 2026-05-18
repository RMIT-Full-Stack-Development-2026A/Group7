export default function Tile({ value, displayValue, markerColor, onClick, disabled, isWinning }) {
  return (
    <button 
      className={`tile ${value ? `mark-${value.toLowerCase()} mark-custom` : ''} ${isWinning ? 'tile-winning' : ''}`}
      style={markerColor ? { '--marker-color': markerColor, color: markerColor } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {displayValue || value}
    </button>
  );
}
