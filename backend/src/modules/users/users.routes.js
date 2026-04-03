const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../../middleware/auth.middleware');
const usersController = require('./controller/users.controller');

// Multer: store avatars in /uploads/avatars
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../../uploads/avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'));
}});

router.get('/:id/profile',  authenticate, usersController.getProfile);
router.patch('/:id/profile', authenticate, usersController.updateProfile);
router.post('/:id/avatar',  authenticate, upload.single('avatar'), usersController.uploadAvatar);
router.get('/:id/games',    authenticate, usersController.getGameHistory);

module.exports = router;
