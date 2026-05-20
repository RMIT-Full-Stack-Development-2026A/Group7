const express = require('express')
const gameController = require('./game.controller')
const { authenticate, optionalAuthenticate } = require('../../middleware/authMiddleware')
const { authorizeAdmin } = require('../../middleware/roleMiddleware')
const { requireActiveAccount } = require('../../middleware/accountStatusMiddleware')
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

router.post('/', optionalAuthenticate, requireActiveAccount, validateCreateGameRequest, gameController.createGame)
router.post('/local-history', optionalAuthenticate, requireActiveAccount, gameController.createLocalHistory)
router.post('/:gameId/join', optionalAuthenticate, requireActiveAccount, validateJoinGameRequest, gameController.joinGame)
router.post('/:gameId/move', optionalAuthenticate, requireActiveAccount, gameController.makeMove)
router.post('/:gameId/ai-move', optionalAuthenticate, requireActiveAccount, gameController.makeAIMove)
router.post('/:gameId/skip-turn', optionalAuthenticate, requireActiveAccount, gameController.skipTurn)
router.post('/:gameId/resign', optionalAuthenticate, requireActiveAccount, validateResignGameRequest, gameController.resignGame)
router.post('/:gameId/abort', optionalAuthenticate, requireActiveAccount, gameController.abortGame)

router.get('/:gameId/replay', validateGetGameRequest, gameController.getGameReplay)
router.get('/:gameId', validateGetGameRequest, gameController.getGame)

// Admin-only maintenance routes.
router.delete('/admin/:gameId', authenticate, authorizeAdmin, gameController.deleteGame)
router.post('/admin/cleanup', authenticate, authorizeAdmin, gameController.cleanupGames)

module.exports = router
