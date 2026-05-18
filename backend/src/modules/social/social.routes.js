const express = require('express')
const socialController = require('./social.controller')
const { authenticate } = require('../../middleware/authMiddleware')
const { requireActiveAccount } = require('../../middleware/accountStatusMiddleware')

const router = express.Router()

router.use(authenticate)

// Read-only endpoints stay accessible so suspended users can still see their
// profile sidebar in a degraded state. Heartbeat is also harmless.
router.get('/summary', socialController.getSummary)
router.get('/players', socialController.getPlayers)
router.post('/presence', socialController.updatePresence)

// Every social write action must be blocked for deactivated accounts.
router.post('/friend-requests', requireActiveAccount, socialController.sendFriendRequest)
router.post('/friend-requests/:id/accept', requireActiveAccount, socialController.acceptFriendRequest)
router.post('/friend-requests/:id/decline', requireActiveAccount, socialController.declineFriendRequest)

router.post('/room-invites', requireActiveAccount, socialController.sendRoomInvite)
router.post('/room-invites/:id/accept', requireActiveAccount, socialController.acceptRoomInvite)
router.post('/room-invites/:id/decline', requireActiveAccount, socialController.declineRoomInvite)

module.exports = router
