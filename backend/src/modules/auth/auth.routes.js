const express = require('express')
const ctrl = require('./auth.controller')
const bruteForce = require('../../middleware/bruteForce')
const { authenticate } = require('../../middleware/authMiddleware')
const { authorizeAdmin } = require('../../middleware/roleMiddleware')

const router = express.Router()

// Listing all users is admin-only. Cần token + role admin.
router.get('/', authenticate, authorizeAdmin, ctrl.getAllUsers)
router.post('/register', ctrl.register)
router.post('/login', bruteForce, ctrl.login)
router.post('/logout', authenticate, ctrl.logout)
router.post('/change-password', authenticate, ctrl.changePassword)

module.exports = router
