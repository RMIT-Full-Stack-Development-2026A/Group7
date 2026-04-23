const express = require('express')
const gameController = require('./game.controller')
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

router.delete('/admin/:gameId', gameController.deleteGame)
router.post('/admin/cleanup', gameController.cleanupGames)

module.exports = router
