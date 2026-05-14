const express = require('express')
const gameController = require('./game.controller')
const { authenticate } = require('../../middleware/authMiddleware')
const { authorizeAdmin } = require('../../middleware/roleMiddleware')
const {
  validateCreateGameRequest,
  validateJoinGameRequest,
  validateGetGameRequest,
  validateResignGameRequest,
  validateGetGameHistoryRequest,
} = require('./game.validator')

const router = express.Router()

router.get('/user/active', gameController.getActiveGames)
router.get('/user/history', validateGetGameHistoryRequest, gameController.getGameHistory)
router.get('/user/stats', gameController.getGameStats)
router.get('/waiting/list', gameController.getWaitingGames)
router.get('/', gameController.getGames)

router.post('/', validateCreateGameRequest, gameController.createGame)
router.post('/local-history', gameController.createLocalHistory)
router.post('/:gameId/join', validateJoinGameRequest, gameController.joinGame)
router.post('/:gameId/move', gameController.makeMove)
router.post('/:gameId/ai-move', gameController.makeAIMove)
router.post('/:gameId/resign', validateResignGameRequest, gameController.resignGame)

router.get('/:gameId/replay', validateGetGameRequest, gameController.getGameReplay)
router.get('/:gameId', validateGetGameRequest, gameController.getGame)

// Admin-only maintenance routes.
router.delete('/admin/:gameId', authenticate, authorizeAdmin, gameController.deleteGame)
router.post('/admin/cleanup', authenticate, authorizeAdmin, gameController.cleanupGames)

module.exports = router
