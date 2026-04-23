const express = require('express')
const ctrl = require('./auth.controller')
const bruteForce = require('../../middleware/bruteForce')

const router = express.Router()

router.get('/', ctrl.getAllUsers)
router.post('/register', ctrl.register)
router.post('/login', bruteForce, ctrl.login)

module.exports = router
