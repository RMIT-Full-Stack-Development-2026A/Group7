// Controller for Starting Page module
const startingPageService = require('../services/startingPageService');

const getMainMenu = async (req, res) => {
  try {
    const menuData = await startingPageService.getMainMenuData();
    res.json(menuData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGames = async (req, res) => {
  try {
    const games = await startingPageService.getAvailableGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMatch = async (req, res) => {
  try {
    const matchData = req.body;
    const result = await startingPageService.createNewMatch(matchData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMainMenu,
  getGames,
  createMatch
};