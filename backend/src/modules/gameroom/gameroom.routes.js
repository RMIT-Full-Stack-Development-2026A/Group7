const express = require('express')
const { authenticate } = require('../../middleware/authMiddleware')
const {
  addPlayerToGameroom,
  removePlayerFromGameroom,
  createGameroom,
  deleteGameroom,
  getAllGamerooms,
  getGameroomById,
  getGameroomByRoomId,
  startGameroom,
  updateGameroomPlayers,
  updateGameroomSettings,
} = require('./gameroom.controller')
const {
  validateCreateGameroomRequest,
  validateUpdateGameroomSettingsRequest,
} = require('./gameroom.validator')

const router = express.Router()

router.get('/', getAllGamerooms)
router.post('/', validateCreateGameroomRequest, createGameroom)
router.get('/roomid/:roomId', getGameroomByRoomId)
router.get('/:id', getGameroomById)
router.patch('/:id/settings', authenticate, validateUpdateGameroomSettingsRequest, updateGameroomSettings)
router.patch('/:id/players', authenticate, updateGameroomPlayers)
router.post('/:id/player', authenticate, addPlayerToGameroom)
router.delete('/:id/player', authenticate, removePlayerFromGameroom)
router.post('/:id/start', authenticate, startGameroom)
router.delete('/:id', authenticate, deleteGameroom)

module.exports = router
