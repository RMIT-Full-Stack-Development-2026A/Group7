const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true },
    requiresAuth: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'starting_page_menu' }
)

const gameCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mode: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'starting_page_games' }
)

const matchSchema = new mongoose.Schema(
  {
    mode: { type: String, required: true },
    gameMode: { type: String, default: '' },
    opponentType: { type: String, default: '' },
    visibility: { type: String, default: 'public' },
    userId: { type: String, default: 'guest' },
    status: { type: String, default: 'created' },
  },
  { timestamps: true, collection: 'starting_page_matches' }
)

const StartingPageMenuItem = mongoose.models.StartingPageMenuItem || mongoose.model('StartingPageMenuItem', menuItemSchema)
const StartingPageGame = mongoose.models.StartingPageGame || mongoose.model('StartingPageGame', gameCardSchema)
const StartingPageMatch = mongoose.models.StartingPageMatch || mongoose.model('StartingPageMatch', matchSchema)

const buildDefaultMenuItems = () => ([
  { name: 'Create Match', type: 'game', path: '/create-match', requiresAuth: true },
  { name: 'Join Match', type: 'game', path: '/join-match', requiresAuth: true },
  { name: 'Settings', type: 'settings', path: '/settings', requiresAuth: true },
  { name: 'Profile', type: 'profile', path: '/profile', requiresAuth: true },
  { name: 'Subscription', type: 'premium', path: '/subscription', requiresAuth: true },
])

const buildDefaultGames = () => ([
  { name: 'Casual Game', mode: 'casual', description: 'Friendly matchmaking against random players.' },
  { name: 'Competitive Mode', mode: 'competitive', description: 'Focused matchmaking for players seeking a tougher queue.' },
  { name: 'Vs Computer', mode: 'computer', description: 'Practice against AI at different difficulties.' },
  { name: 'Vs Friend', mode: 'friend', description: 'Play locally or with a friend.' },
])

const buildMatch = (matchData) => ({
  ...matchData,
  status: 'created',
})

const ensureStartingPageSeedData = async () => {
  const menuCount = await StartingPageMenuItem.countDocuments()
  if (!menuCount) {
    await StartingPageMenuItem.insertMany(buildDefaultMenuItems())
  }

  const gameCount = await StartingPageGame.countDocuments()
  if (!gameCount) {
    await StartingPageGame.insertMany(buildDefaultGames())
  }
}

module.exports = {
  StartingPageMenuItem,
  StartingPageGame,
  StartingPageMatch,
  buildDefaultMenuItems,
  buildDefaultGames,
  buildMatch,
  ensureStartingPageSeedData,
}
