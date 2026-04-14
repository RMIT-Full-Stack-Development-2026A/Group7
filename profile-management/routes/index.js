// Routes for Profile Management module
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Define routes
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.get('/settings', profileController.getSettings);
router.put('/settings', profileController.updateSettings);
router.get('/mailbox', profileController.getMailbox);
router.post('/subscription', profileController.manageSubscription);

module.exports = router;