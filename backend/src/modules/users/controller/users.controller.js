const usersService = require('../service/users.service');

async function getProfile(req, res, next) {
  try {
    // Players can only view their own profile unless admin
    if (req.user.role !== 'admin' && req.user.userId.toString() !== req.params.id)
      return res.status(403).json({ error: 'Access denied' });
    const user = await usersService.getProfile(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    if (req.user.role !== 'admin' && req.user.userId.toString() !== req.params.id)
      return res.status(403).json({ error: 'Access denied' });
    const user = await usersService.updateProfile(req.params.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

async function uploadAvatar(req, res, next) {
  try {
    if (req.user.userId.toString() !== req.params.id)
      return res.status(403).json({ error: 'Access denied' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await usersService.saveAvatar(req.params.id, req.file);
    res.json(user);
  } catch (err) { next(err); }
}

async function getGameHistory(req, res, next) {
  try {
    if (req.user.role !== 'admin' && req.user.userId.toString() !== req.params.id)
      return res.status(403).json({ error: 'Access denied' });
    const games = await usersService.getGameHistory(req.params.id);
    res.json(games);
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, uploadAvatar, getGameHistory };
