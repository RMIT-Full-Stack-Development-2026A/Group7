import React from 'react';

export default function MoveOption({ value, onChange, darkMode }) {
  const moveOptions = [
    { value: 'X', label: 'X' },
    { value: 'O', label: 'O' },
    { value: 'random', label: 'Random' }
  ];

  return (
    <div className="d-flex align-items-center gap-3">
      <label className={`${darkMode ? 'text-light' : 'text-dark'}`}>First Move</label>
      <div className="d-flex gap-2">
        {moveOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`btn move-option-btn ${
              value === option.value
                ? darkMode
                  ? 'btn-primary active'
                  : 'btn-indigo active'
                : darkMode
                  ? 'btn-outline-secondary'
                  : 'btn-outline-indigo'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
