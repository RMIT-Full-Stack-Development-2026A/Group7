const express = require('express')
const adminController = require('./admin.controller')
const { authenticate } = require('../../middleware/authMiddleware')
const { authorizeAdmin } = require('../../middleware/roleMiddleware')

const router = express.Router()

// All admin endpoints require a valid JWT and the admin role.
router.use(authenticate, authorizeAdmin)

router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

router.get('/games', adminController.getGames)
router.post('/games/:id/abort', adminController.abortGame)

module.exports = router
