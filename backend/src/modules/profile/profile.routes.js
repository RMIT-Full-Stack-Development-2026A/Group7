const express = require('express');
const profileController = require('./profile.controller');

const router = express.Router();

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.get('/settings', profileController.getSettings);
router.put('/settings', profileController.updateSettings);
router.get('/mailbox', profileController.getMailbox);
router.post('/subscription', profileController.manageSubscription);

module.exports = router;
