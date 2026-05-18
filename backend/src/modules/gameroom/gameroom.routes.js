const express = require('express')
const {
  addPlayerToGameroom,
  addGameroomChatMessage,
  removePlayerFromGameroom,
  createGameroom,
  deleteGameroom,
  getAllGamerooms,
  getGameroomChatMessages,
  getGameroomById,
  getGameroomByRoomId,
  startGameroom,
  updateGameroomPlayers,
  updateGameroomSettings,
} = require('./gameroom.controller')
const { authenticate, optionalAuthenticate } = require('../../middleware/authMiddleware')
const { requireActiveAccount } = require('../../middleware/accountStatusMiddleware')
const {
  validateCreateGameroomRequest,
  validateUpdateGameroomSettingsRequest,
} = require('./gameroom.validator')

const router = express.Router()

router.get('/', getAllGamerooms)
router.post('/', optionalAuthenticate, requireActiveAccount, validateCreateGameroomRequest, createGameroom)
router.get('/roomid/:roomId', getGameroomByRoomId)
router.get('/:id/chat', getGameroomChatMessages)
router.post('/:id/chat', optionalAuthenticate, requireActiveAccount, addGameroomChatMessage)
router.get('/:id', getGameroomById)
router.patch('/:id/settings', optionalAuthenticate, requireActiveAccount, validateUpdateGameroomSettingsRequest, updateGameroomSettings)
router.patch('/:id/players', optionalAuthenticate, requireActiveAccount, updateGameroomPlayers)
router.post('/:id/player', optionalAuthenticate, requireActiveAccount, addPlayerToGameroom)
// Self-leave only: dùng userId từ JWT, không cho client truyền userId trong body.
// Deactivated users may still leave a room so they don't stay stuck inside one.
router.delete('/:id/player', authenticate, removePlayerFromGameroom)
router.post('/:id/start', optionalAuthenticate, requireActiveAccount, startGameroom)
router.delete('/:id', optionalAuthenticate, requireActiveAccount, deleteGameroom)

module.exports = router
