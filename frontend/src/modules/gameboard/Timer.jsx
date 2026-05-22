import React from 'react';
import { formatClock } from './timer.utils.js';

export default function Timer({ seconds, isActive, compact = false }) {
  const getTimerClass = () => {
    if (seconds <= 10) return 'timer-critical';
    if (seconds <= 30) return 'timer-warning';
    return 'timer-normal';
  };

  return (
    <div className={`timer-display ${compact ? 'timer-display-compact' : ''} ${isActive ? getTimerClass() : 'timer-idle'}`}>
      <i className="bi bi-clock" />
      <div className="timer-value">{formatClock(seconds)}</div>
    </div>
  );
}
