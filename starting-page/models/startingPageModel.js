// Data access layer for Starting Page module
// This would typically interact with a database

const getMenuItems = async () => {
  // Mock data - replace with actual database queries
  return [
    { id: 1, name: 'Play Game', type: 'game', requiresAuth: true },
    { id: 2, name: 'Settings', type: 'settings', requiresAuth: true },
    { id: 3, name: 'Profile', type: 'profile', requiresAuth: true }
  ];
};

const getGamesList = async () => {
  // Mock data
  return [
    { id: 1, name: 'Casual Game', mode: 'casual' },
    { id: 2, name: 'Ranked Mode', mode: 'ranked' },
    { id: 3, name: 'Vs Computer', mode: 'computer' },
    { id: 4, name: 'Vs Friend', mode: 'friend' }
  ];
};

const createMatch = async (matchData) => {
  // Mock implementation
  return { id: Date.now(), ...matchData, status: 'created' };
};

module.exports = {
  getMenuItems,
  getGamesList,
  createMatch
};