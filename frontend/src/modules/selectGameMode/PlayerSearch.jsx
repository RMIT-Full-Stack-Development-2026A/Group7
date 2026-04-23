import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function PlayerSearch() {
  const [userFound, setUserFound] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulate searching for a user (3 seconds)
    const timer = setTimeout(() => {
      // Generate random user data
      const randomUser = {
        name: `Player${Math.floor(Math.random() * 9999)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
      };

      setUserData(randomUser);
      setUserFound(true);

      // Trigger fireworks effect
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!userFound) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Searching for user...</div>
      </div>
    );
  }

  return (
    <div className="user-found-container">
      <h2 className="user-found-title">
        <i className="bi bi-grid-3x3-gap-fill"></i> Opponent Found!
      </h2>
      <div className="user-profile">
        <img
          src={userData.avatar}
          alt={userData.name}
          className="user-profile-pic"
        />
        <div className="user-profile-name">{userData.name}</div>
      </div>
      <button
        className="next-button"
        style={{ marginTop: '3rem' }}
        onClick={() => alert('Starting game...')}
      >
        Start Game
      </button>
    </div>
  );
}
