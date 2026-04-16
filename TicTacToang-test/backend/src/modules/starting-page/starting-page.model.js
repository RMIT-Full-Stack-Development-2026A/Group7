const STARTING_PAGE_COLLECTIONS = {
  menuItems: 'starting_page_menu',
  games: 'starting_page_games',
  matches: 'starting_page_matches',
};

const buildDefaultMenuItems = () => ([
  { id: 1, name: 'Play Game', type: 'game', requiresAuth: true },
  { id: 2, name: 'Settings', type: 'settings', requiresAuth: true },
  { id: 3, name: 'Profile', type: 'profile', requiresAuth: true },
]);

const buildDefaultGames = () => ([
  { id: 1, name: 'Casual Game', mode: 'casual' },
  { id: 2, name: 'Ranked Mode', mode: 'ranked' },
  { id: 3, name: 'Vs Computer', mode: 'computer' },
  { id: 4, name: 'Vs Friend', mode: 'friend' },
]);

const buildMatch = (matchData) => ({
  id: Date.now(),
  ...matchData,
  status: 'created',
  createdAt: new Date(),
});

module.exports = {
  STARTING_PAGE_COLLECTIONS,
  buildDefaultMenuItems,
  buildDefaultGames,
  buildMatch,
};
