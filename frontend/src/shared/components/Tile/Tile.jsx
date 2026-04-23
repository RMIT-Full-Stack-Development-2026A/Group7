export default function Tile({ value, displayValue, onClick, disabled, isWinning }) {
  return (
    <button 
      className={`tile ${value ? `mark-${value.toLowerCase()}` : ''} ${isWinning ? 'tile-winning' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {displayValue || value}
    </button>
  );
}
