// Routes for Starting Page module
const express = require('express');
const router = express.Router();
const startingPageController = require('../controllers/startingPageController');

// Define routes
router.get('/menu', startingPageController.getMainMenu);
router.get('/games', startingPageController.getGames);
router.post('/match', startingPageController.createMatch);

module.exports = router;