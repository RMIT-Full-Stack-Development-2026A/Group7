import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'btn-primary',
    orange: 'btn-orange',
    cancel: 'btn-secondary',
    save: 'btn-primary'
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
