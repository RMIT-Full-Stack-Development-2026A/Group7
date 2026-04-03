const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const subController = require('./controller/subscription.controller');

router.post('/purchase', authenticate, subController.purchase);
router.get('/my',        authenticate, subController.mySubscription);

module.exports = router;
