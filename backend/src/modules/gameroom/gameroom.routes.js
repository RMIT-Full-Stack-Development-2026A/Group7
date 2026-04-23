const express = require('express')
const jwt = require('jsonwebtoken')
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

const optionalAuthenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      req.user = null
    }
  }

  next()
}

router.get('/', getAllGamerooms)
router.post('/', validateCreateGameroomRequest, createGameroom)
router.get('/roomid/:roomId', getGameroomByRoomId)
router.get('/:id', getGameroomById)
router.patch('/:id/settings', optionalAuthenticate, validateUpdateGameroomSettingsRequest, updateGameroomSettings)
router.patch('/:id/players', optionalAuthenticate, updateGameroomPlayers)
router.post('/:id/player', optionalAuthenticate, addPlayerToGameroom)
router.delete('/:id/player', optionalAuthenticate, removePlayerFromGameroom)
router.post('/:id/start', optionalAuthenticate, startGameroom)
router.delete('/:id', optionalAuthenticate, deleteGameroom)

module.exports = router
