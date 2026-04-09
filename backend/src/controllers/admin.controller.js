const User = require('../models/User');
const Game = require('../models/GameSession'); // assume Game model exists
const gameService = require('../services/game.service');

async function getUsers(req, res) {
  const { page = 1, limit = 50, q } = req.query;
  const filter = {};
  if (q) filter.$or = [{ username: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();
  const total = await User.countDocuments(filter);
  res.json({ ok: true, data: users, meta: { page: Number(page), limit: Number(limit), total } });
}

async function patchUser(req, res) {
  const { id } = req.params;
  const updates = req.body;
  // whitelist fields
  const allowed = ['isActive', 'role', 'premiumStatus', 'subscriptionEndDate'];
  const payload = {};
  allowed.forEach(k => { if (k in updates) payload[k] = updates[k]; });
  const user = await User.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, data: user });
}

async function getGames(req, res) {
  const { status } = req.query; // optional filter: ACTIVE, WAITING, FINISHED
  const filter = {};
  if (status) filter.status = status;
  const games = await Game.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
  res.json({ ok: true, data: games });
}

async function abortGame(req, res) {
  const { roomId } = req.params;
  const result = await gameService.abortRoom(roomId, req.user);
  if (!result.ok) return res.status(400).json(result);
  res.json({ ok: true, message: 'Room aborted', roomId });
}

module.exports = { getUsers, patchUser, getGames, abortGame };