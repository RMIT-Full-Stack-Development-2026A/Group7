import React from 'react';

export default function Selector({ label, value, onChange, options, darkMode = true }) {
  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      {label && (
        <label className={`selector-label ${darkMode ? 'text-light' : 'text-dark'}`}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`form-select flex-grow-1 ${darkMode ? 'select-dark' : 'select-light'}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
