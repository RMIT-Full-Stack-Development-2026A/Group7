import { useDifficultyMenu } from '../../hooks/useDifficultyMenu.js';

export function DifficultyMenu({ onSelect }) {
  const { difficultyOptions } = useDifficultyMenu();

  return (
    <div className="difficulty-menu">
      <div className="difficulty-menu-header">Select AI difficulty</div>
      {difficultyOptions.map((item) => (
        <button key={item.level} onClick={() => onSelect(item.level)} className="difficulty-option">
          <i className={`bi ${item.icon} difficulty-icon`} style={{ color: item.color }} />
          <span>{item.level}</span>
        </button>
      ))}
    </div>
  );
}
