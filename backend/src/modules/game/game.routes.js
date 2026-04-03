const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const gameController = require('./controller/game.controller');

router.post('/',                    authenticate, gameController.createGame);
router.get('/rooms',                authenticate, gameController.listRooms);
router.get('/:roomId',              authenticate, gameController.getRoom);
router.post('/:roomId/join',        authenticate, gameController.joinRoom);
router.post('/:roomId/abort',       authenticate, gameController.abortGame);
router.post('/:roomId/move',        authenticate, gameController.makeLocalMove); // local 2-player
router.get('/:roomId/replay',       authenticate, gameController.getReplay);

module.exports = router;
