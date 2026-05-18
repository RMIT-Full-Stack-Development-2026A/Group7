import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'btn-primary settings-action-btn',
    orange: 'btn-orange settings-action-btn',
    cancel: 'btn-secondary settings-action-btn',
    save: 'btn-primary settings-action-btn'
  };

  return (
    <button
      onClick={onClick}
      className={`btn ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
