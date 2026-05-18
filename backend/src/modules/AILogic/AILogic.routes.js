const express = require('express')
const { getMove } = require('./AILogic.controller')

const router = express.Router()

router.post('/move', getMove)

module.exports = router
