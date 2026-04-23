const startingPageService = require('./starting-page.service');

const getStatusCode = (error) => error.statusCode || 500;

const getMainMenu = async (req, res) => {
  try {
    const menuData = await startingPageService.getMainMenuData();
    res.json(menuData);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const getGames = async (req, res) => {
  try {
    const games = await startingPageService.getAvailableGames();
    res.json(games);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const createMatch = async (req, res) => {
  try {
    const result = await startingPageService.createNewMatch(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

module.exports = {
  getMainMenu,
  getGames,
  createMatch,
};
