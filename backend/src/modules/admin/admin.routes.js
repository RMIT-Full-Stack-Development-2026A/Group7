const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../../middleware/auth.middleware');
const adminController = require('./controller/admin.controller');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

router.get('/users',                     adminController.listUsers);
router.patch('/users/:id',               adminController.updateUserStatus);
router.get('/games',                     adminController.listGames);
router.post('/games/:roomId/abort',      adminController.abortGame);
router.get('/subscriptions',             adminController.listSubscriptions);

module.exports = router;
