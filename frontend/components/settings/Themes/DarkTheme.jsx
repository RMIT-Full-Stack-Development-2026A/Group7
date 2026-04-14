import React from 'react';

export default function DarkTheme({ isActive, onToggle, darkMode }) {
  return (
    <div className={`theme-card p-4 rounded ${darkMode ? 'card-dark' : 'card-light'}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <i className={`bi bi-display fs-1 ${darkMode ? 'text-primary' : 'text-indigo'}`}></i>
          <div>
            <h3 className={`mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>
              Dark Mode
            </h3>
            <p className={`mb-0 small ${darkMode ? 'text-secondary' : 'text-muted'}`}>
              Toggle dark/light theme
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`toggle-switch ${isActive ? 'active' : ''}`}
        >
          <div className="toggle-slider"></div>
        </button>
      </div>
    </div>
  );
}
