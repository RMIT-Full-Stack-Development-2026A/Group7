// Pure-ish helpers used by social.service.js: user snapshots, lookup utilities,
// and the friend/request relation cache.
const { ErrorResponse } = require('../../shared/errors/AppErrors')
const User = require('../auth/auth.model')
const { FriendRequest, Friendship } = require('./social.model')

const PUBLIC_USER_SELECT = '_id name username email avatar accountStatus timeoutUntil lastLoginAt lastSeenAt isPremium createdAt'
const ONLINE_WINDOW_MS = 45 * 1000

const toUserId = (value) => String(value || '')

const getUserSnapshot = (user) => ({
  userId: toUserId(user?._id || user?.userId),
  name: user?.name || user?.username || 'Player',
  username: user?.username || '',
  email: user?.email || '',
  avatar: user?.avatar || '',
})

const toPublicUser = (user) => {
  const timeoutUntil = user?.timeoutUntil ? new Date(user.timeoutUntil) : null
  const isTimedOut = Boolean(timeoutUntil && timeoutUntil > new Date())
  const lastSeenAt = user?.lastSeenAt ? new Date(user.lastSeenAt) : null
  const isRecentlySeen = Boolean(lastSeenAt && Date.now() - lastSeenAt.getTime() <= ONLINE_WINDOW_MS)
  const accountStatus = user?.accountStatus === 'inactive'
    ? 'inactive'
    : isTimedOut ? 'timeout' : 'active'

  return {
    userId: toUserId(user?._id || user?.userId),
    name: user?.name || user?.username || 'Player',
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    accountStatus,
    isOnline: accountStatus === 'active' && isRecentlySeen,
    lastSeenAt: lastSeenAt?.toISOString() || null,
    isPremium: Boolean(user?.isPremium),
  }
}

const resolveUser = async (userId) => {
  const user = await User.findById(userId).select(PUBLIC_USER_SELECT).lean().catch(() => null)
  if (!user) throw new ErrorResponse('User not found', 404)
  return user
}

const getFriendshipPair = (firstUserId, secondUserId) =>
  [toUserId(firstUserId), toUserId(secondUserId)].sort()

const findFriendship = (firstUserId, secondUserId) => {
  const [userA, userB] = getFriendshipPair(firstUserId, secondUserId)
  return Friendship.findOne({ userA, userB })
}

const assertDifferentUsers = (firstUserId, secondUserId) => {
  if (toUserId(firstUserId) === toUserId(secondUserId)) {
    throw new ErrorResponse('You cannot perform this action on your own account.', 400)
  }
}

const getRelatedSocialState = async (currentUserId) => {
  const [friendships, pendingRequests] = await Promise.all([
    Friendship.find({ users: currentUserId }).lean(),
    FriendRequest.find({
      status: 'pending',
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    }).lean(),
  ])

  const friendIds = new Set(
    friendships.flatMap((friendship) => friendship.users).filter((id) => id !== currentUserId)
  )
  const pendingRequestUserIds = new Set(
    pendingRequests.flatMap((request) => [request.requester, request.recipient])
  )
  pendingRequestUserIds.delete(currentUserId)

  return { friendIds, pendingRequestUserIds }
}

module.exports = {
  PUBLIC_USER_SELECT,
  toUserId,
  getUserSnapshot,
  toPublicUser,
  resolveUser,
  getFriendshipPair,
  findFriendship,
  assertDifferentUsers,
  getRelatedSocialState,
}
