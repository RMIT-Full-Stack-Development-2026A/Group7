// Service layer for Starting Page module
const startingPageModel = require('../models/startingPageModel');

const getMainMenuData = async () => {
  // Business logic for main menu
  return await startingPageModel.getMenuItems();
};

const getAvailableGames = async () => {
  // Business logic for games
  return await startingPageModel.getGamesList();
};

const createNewMatch = async (matchData) => {
  // Business logic for creating match
  return await startingPageModel.createMatch(matchData);
};

module.exports = {
  getMainMenuData,
  getAvailableGames,
  createNewMatch
};