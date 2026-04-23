import React from 'react';

export default function Slider({ label, value, onChange, min = 0, max = 100, darkMode = true }) {
  return (
    <div className={`setting-control setting-slider ${darkMode ? 'setting-control-dark' : 'setting-control-light'}`}>
      <label className={`slider-label ${darkMode ? 'text-light' : 'text-dark'}`}>
        {label}
      </label>
      <div className="setting-slider-track-group">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`form-range flex-grow-1 settings-range ${darkMode ? 'slider-dark' : 'slider-light'}`}
        />
      </div>
      <span className={`slider-value ${darkMode ? 'text-light' : 'text-dark'}`}>
        {value}%
      </span>
    </div>
  );
}
