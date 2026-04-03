const User = require('../../../models/User');
const GameSession = require('../../../models/GameSession');
const Subscription = require('../../../models/Subscription');
const gameService = require('../../game/service/game.service');

async function listUsers({ search } = {}) {
  const query = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } },
    ];
  }
  return User.find(query)
    .select('username email premiumStatus accountStatus country createdAt avatar')
    .sort({ createdAt: -1 })
    .lean();
}

async function updateUserStatus(userId, accountStatus) {
  if (!['active', 'banned'].includes(accountStatus)) {
    const e = new Error('Invalid status. Use "active" or "banned"'); e.status = 400; throw e;
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { accountStatus },
    { new: true }
  ).select('username email accountStatus');
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }
  return user;
}

async function listGames({ status, search } = {}) {
  const query = {};
  if (status) query.status = status;
  if (search) {
    // search by roomId or player name (need lookup – simple approach: fetch then filter)
  }
  return GameSession.find(query)
    .populate('player1', 'username')
    .populate('player2', 'username')
    .select('roomId gameType status player1 player2 player2Name startTime endTime boardSize')
    .sort({ startTime: -1 })
    .lean();
}

async function abortGame(roomId, adminUserId) {
  return gameService.abortGame(roomId, adminUserId, true);
}

async function listSubscriptions() {
  return Subscription.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = { listUsers, updateUserStatus, listGames, abortGame, listSubscriptions };
