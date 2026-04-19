const {
  StartingPageGame,
  StartingPageMatch,
  StartingPageMenuItem,
  buildMatch,
  ensureStartingPageSeedData,
} = require('./starting-page.model')

const getMenuItems = async () => {
  await ensureStartingPageSeedData()
  return StartingPageMenuItem.find().sort({ createdAt: 1 }).lean()
}

const getGamesList = async () => {
  await ensureStartingPageSeedData()
  return StartingPageGame.find().sort({ createdAt: 1 }).lean()
}

const createMatch = async (matchData) => StartingPageMatch.create(buildMatch(matchData))

module.exports = {
  getMenuItems,
  getGamesList,
  createMatch,
}
