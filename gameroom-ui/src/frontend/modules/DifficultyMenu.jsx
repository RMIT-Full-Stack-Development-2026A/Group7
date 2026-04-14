const difficulty = [
  { level: 'Easy', icon: 'bi-robot', color: '#7CFC00' },
  { level: 'Medium', icon: 'bi-lightning-charge-fill', color: '#FFD54F' },
  { level: 'Hard', icon: 'bi-fire', color: '#ffaa0d' },
];

export function DifficultyMenu({ onSelect }) {
  return (
    <div className="difficulty-menu">
      <div className="difficulty-menu-header">Select AI difficulty</div>
      {difficulty.map((item) => (
        <button key={item.level} onClick={() => onSelect(item.level)} className="difficulty-option">
          <i className={`bi ${item.icon} difficulty-icon`} style={{ color: item.color }} />
          <span>{item.level}</span>
        </button>
      ))}
    </div>
  );
}
