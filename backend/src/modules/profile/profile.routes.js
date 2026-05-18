const express = require('express');
const jwt = require('jsonwebtoken');
const profileController = require('./profile.controller');

const router = express.Router();

const optionalAuthenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }

  next();
};

router.get('/', optionalAuthenticate, profileController.getProfile);
router.put('/', optionalAuthenticate, profileController.updateProfile);
router.get('/settings', optionalAuthenticate, profileController.getSettings);
router.put('/settings', optionalAuthenticate, profileController.updateSettings);
router.post('/subscription/paypal/order', optionalAuthenticate, profileController.createPayPalSubscriptionOrder);
router.post('/subscription/paypal/capture', optionalAuthenticate, profileController.capturePayPalSubscriptionOrder);
router.post('/subscription', optionalAuthenticate, profileController.manageSubscription);

module.exports = router;
