const express = require('express')
const adminController = require('./admin.controller')

const router = express.Router()

router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

router.get('/games', adminController.getGames)
router.post('/games/:id/abort', adminController.abortGame)

module.exports = router
