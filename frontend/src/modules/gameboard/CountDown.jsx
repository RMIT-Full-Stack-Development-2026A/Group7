import React, { useEffect, useState } from 'react';

export default function CountdownModal({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      setTimeout(() => onComplete(), 800);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-center py-5">
          <div className="modal-body">
            {count > 0 ? (
              <h1 className="display-1 countdown-number">{count}</h1>
            ) : (
              <h1 className="display-3 game-begin-text">Game Begin!</h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
