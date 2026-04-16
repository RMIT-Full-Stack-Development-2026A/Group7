const {
  buildDefaultGames,
  buildDefaultMenuItems,
  buildMatch,
} = require('./starting-page.model');

const getMenuItems = async () => buildDefaultMenuItems();

const getGamesList = async () => buildDefaultGames();

const createMatch = async (matchData) => buildMatch(matchData);

module.exports = {
  getMenuItems,
  getGamesList,
  createMatch,
};
