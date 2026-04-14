const express = require('express');
const roomController = require('../controllers/roomController');
const { validateCreateRoomRequest, validateUpdateRoomSettingsRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

// POST /api/room - Create a new room
router.post('/', validateCreateRoomRequest, roomController.createRoom);

// GET /api/room/:id - Get room by MongoDB ID
router.get('/:id', roomController.getRoomById);

// GET /api/room/roomid/:roomId - Get room by Room ID (the display ID)
router.get('/roomid/:roomId', roomController.getRoomByRoomId);

// PATCH /api/room/:id/settings - Update room settings
router.patch('/:id/settings', validateUpdateRoomSettingsRequest, roomController.updateRoomSettings);

// PATCH /api/room/:id/players - Replace room players with current room state
router.patch('/:id/players', roomController.updateRoomPlayers);

// POST /api/room/:id/player - Add player to room
router.post('/:id/player', roomController.addPlayerToRoom);

// POST /api/room/:id/start - Start game
router.post('/:id/start', roomController.startGame);

// DELETE /api/room/:id - Delete room
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
