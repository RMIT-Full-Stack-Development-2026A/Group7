import { Router } from 'express'
import {
  addPlayerToGameroom,
  createGameroom,
  deleteGameroom,
  getAllGamerooms,
  getGameroomById,
  getGameroomByRoomId,
  startGameroom,
  updateGameroomPlayers,
  updateGameroomSettings,
} from './gameroom.controller.js'
import {
  validateCreateGameroomRequest,
  validateUpdateGameroomSettingsRequest,
} from './gameroom.validator.js'

const router = Router()

router.get('/', getAllGamerooms)
router.post('/', validateCreateGameroomRequest, createGameroom)
router.get('/roomid/:roomId', getGameroomByRoomId)
router.get('/:id', getGameroomById)
router.patch('/:id/settings', validateUpdateGameroomSettingsRequest, updateGameroomSettings)
router.patch('/:id/players', updateGameroomPlayers)
router.post('/:id/player', addPlayerToGameroom)
router.post('/:id/start', startGameroom)
router.delete('/:id', deleteGameroom)

export default router
