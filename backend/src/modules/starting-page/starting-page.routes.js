const express = require('express');
const startingPageController = require('./starting-page.controller');

const router = express.Router();

router.get('/menu', startingPageController.getMainMenu);
router.get('/games', startingPageController.getGames);
router.post('/match', startingPageController.createMatch);

module.exports = router;
