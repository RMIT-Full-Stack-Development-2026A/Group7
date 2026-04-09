const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middlewares/role.middleware');

router.use(requireAdmin);

router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.patchUser);
router.get('/games', adminController.getGames);
router.post('/games/:roomId/abort', adminController.abortGame);

module.exports = router;