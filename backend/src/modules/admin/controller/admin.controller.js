const adminService = require('../service/admin.service');

async function listUsers(req, res, next) {
  try { res.json(await adminService.listUsers(req.query)); } catch (e) { next(e); }
}

async function updateUserStatus(req, res, next) {
  try {
    const result = await adminService.updateUserStatus(req.params.id, req.body.accountStatus);
    res.json(result);
  } catch (e) { next(e); }
}

async function listGames(req, res, next) {
  try { res.json(await adminService.listGames(req.query)); } catch (e) { next(e); }
}

async function abortGame(req, res, next) {
  try {
    const result = await adminService.abortGame(req.params.roomId, req.user.userId);
    res.json(result);
  } catch (e) { next(e); }
}

async function listSubscriptions(req, res, next) {
  try { res.json(await adminService.listSubscriptions()); } catch (e) { next(e); }
}

module.exports = { listUsers, updateUserStatus, listGames, abortGame, listSubscriptions };
