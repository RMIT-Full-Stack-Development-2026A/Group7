import React from 'react';

export default function Slider({ label, value, onChange, min = 0, max = 100, darkMode = true }) {
  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      <label className={`slider-label ${darkMode ? 'text-light' : 'text-dark'}`}>
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`form-range flex-grow-1 ${darkMode ? 'slider-dark' : 'slider-light'}`}
      />
      <span className={`slider-value ${darkMode ? 'text-light' : 'text-dark'}`}>
        {value}%
      </span>
    </div>
  );
}
