import React from 'react';

export default function Timer({ seconds, isActive }) {
  const getTimerClass = () => {
    if (seconds <= 10) return 'timer-critical';
    if (seconds <= 20) return 'timer-warning';
    return 'timer-normal';
  };

  return (
    <div className={`timer-display ${isActive ? getTimerClass() : 'timer-normal'}`}>
      <i className="bi bi-clock"> </i>
      <div className="timer-value">{seconds}s</div>
    </div>
  );
}
