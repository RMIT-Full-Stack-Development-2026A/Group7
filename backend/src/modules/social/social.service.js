const { ErrorResponse } = require('../../shared/errors/AppErrors')
const User = require('../auth/auth.model')
const gameroomService = require('../gameroom/gameroom.service')
const { FriendRequest, Friendship, RoomInvite } = require('./social.model')
const {
  PUBLIC_USER_SELECT,
  toUserId,
  getUserSnapshot,
  toPublicUser,
  resolveUser,
  getFriendshipPair,
  findFriendship,
  assertDifferentUsers,
  getRelatedSocialState,
} = require('./social.service.helpers')

const listPlayers = async (currentUserId) => {
  const { friendIds, pendingRequestUserIds } = await getRelatedSocialState(currentUserId)
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select(PUBLIC_USER_SELECT)
    .sort({ name: 1, username: 1 })
    .lean()

  return users.map((user) => {
    const publicUser = toPublicUser(user)
    return {
      ...publicUser,
      friendshipStatus: friendIds.has(publicUser.userId)
        ? 'friend'
        : pendingRequestUserIds.has(publicUser.userId) ? 'pending' : 'none',
    }
  })
}

const listFriends = async (currentUserId) => {
  const friendships = await Friendship.find({ users: currentUserId }).lean()
  const friendIds = friendships
    .flatMap((friendship) => friendship.users)
    .filter((id) => id !== currentUserId)

  if (!friendIds.length) return []

  const users = await User.find({ _id: { $in: friendIds } })
    .select(PUBLIC_USER_SELECT)
    .sort({ name: 1, username: 1 })
    .lean()
  return users.map(toPublicUser)
}

const listFriendRequests = async (currentUserId) => {
  const requests = await FriendRequest.find({
    status: 'pending',
    $or: [{ requester: currentUserId }, { recipient: currentUserId }],
  }).sort({ createdAt: -1 }).lean()

  return requests.map((request) => ({
    id: toUserId(request._id),
    status: request.status,
    direction: request.recipient === currentUserId ? 'incoming' : 'outgoing',
    from: request.requester === currentUserId ? request.recipientSnapshot : request.requesterSnapshot,
    to: request.recipient === currentUserId ? request.requesterSnapshot : request.recipientSnapshot,
    createdAt: request.createdAt,
  }))
}

const listRoomInvites = async (currentUserId) => {
  const invites = await RoomInvite.find({ recipient: currentUserId, status: 'pending' })
    .sort({ createdAt: -1 })
    .lean()

  return invites.map((invite) => ({
    id: toUserId(invite._id),
    from: invite.senderSnapshot,
    roomMongoId: invite.roomMongoId,
    roomId: invite.roomId,
    roomName: invite.roomName,
    status: invite.status,
    createdAt: invite.createdAt,
  }))
}

const getSummary = async (currentUserId) => {
  const [friends, requests, roomInvites, players] = await Promise.all([
    listFriends(currentUserId),
    listFriendRequests(currentUserId),
    listRoomInvites(currentUserId),
    listPlayers(currentUserId),
  ])
  return { friends, requests, roomInvites, players }
}

const updatePresence = async (currentUserId, isOnline = true) => {
  if (!currentUserId) throw new ErrorResponse('Authentication required.', 401)

  const user = await User.findByIdAndUpdate(
    currentUserId,
    { lastSeenAt: isOnline ? new Date() : null },
    { new: true }
  ).select(PUBLIC_USER_SELECT).lean()

  if (!user) throw new ErrorResponse('User not found', 404)
  return toPublicUser(user)
}

const sendFriendRequest = async (currentUserId, recipientId) => {
  assertDifferentUsers(currentUserId, recipientId)

  const [requester, recipient] = await Promise.all([
    resolveUser(currentUserId),
    resolveUser(recipientId),
  ])

  if (await findFriendship(currentUserId, recipientId)) {
    throw new ErrorResponse('You are already friends with this user.', 409)
  }

  const reverseRequest = await FriendRequest.findOne({
    requester: recipientId,
    recipient: currentUserId,
    status: 'pending',
  })
  if (reverseRequest) return acceptFriendRequest(currentUserId, reverseRequest._id)

  return FriendRequest.findOneAndUpdate(
    { requester: currentUserId, recipient: recipientId, status: 'pending' },
    {
      $setOnInsert: {
        requester: currentUserId,
        recipient: recipientId,
        requesterSnapshot: getUserSnapshot(requester),
        recipientSnapshot: getUserSnapshot(recipient),
        status: 'pending',
      },
    },
    { new: true, upsert: true }
  ).lean()
}

const acceptFriendRequest = async (currentUserId, requestId) => {
  const request = await FriendRequest.findById(requestId)
  if (!request || request.status !== 'pending') {
    throw new ErrorResponse('Friend request not found.', 404)
  }
  if (request.recipient !== currentUserId) {
    throw new ErrorResponse('Only the recipient can accept this friend request.', 403)
  }

  const [userA, userB] = getFriendshipPair(request.requester, request.recipient)
  await Friendship.findOneAndUpdate(
    { userA, userB },
    { $setOnInsert: { users: [userA, userB], userA, userB } },
    { new: true, upsert: true }
  )

  request.status = 'accepted'
  await request.save()
  return getSummary(currentUserId)
}

const declineFriendRequest = async (currentUserId, requestId) => {
  const request = await FriendRequest.findById(requestId)
  if (!request || request.status !== 'pending') {
    throw new ErrorResponse('Friend request not found.', 404)
  }
  if (request.recipient !== currentUserId && request.requester !== currentUserId) {
    throw new ErrorResponse('You cannot update this friend request.', 403)
  }

  request.status = 'declined'
  await request.save()
  return getSummary(currentUserId)
}

const sendRoomInvite = async (currentUserId, recipientId, roomMongoId) => {
  assertDifferentUsers(currentUserId, recipientId)

  const [sender, recipient, room] = await Promise.all([
    resolveUser(currentUserId),
    resolveUser(recipientId),
    gameroomService.getGameroomById(roomMongoId),
  ])

  if (String(room.host) !== currentUserId) {
    throw new ErrorResponse('Only the room host can invite friends.', 403)
  }
  if (!(await findFriendship(currentUserId, recipientId))) {
    throw new ErrorResponse('You can only invite friends to a room.', 403)
  }

  return RoomInvite.findOneAndUpdate(
    { sender: currentUserId, recipient: recipientId, roomMongoId, status: 'pending' },
    {
      $setOnInsert: {
        sender: currentUserId,
        recipient: recipientId,
        senderSnapshot: getUserSnapshot(sender),
        recipientSnapshot: getUserSnapshot(recipient),
        roomMongoId,
        roomId: room.roomId,
        roomName: room.roomName,
        status: 'pending',
      },
    },
    { new: true, upsert: true }
  ).lean()
}

const acceptRoomInvite = async (currentUserId, inviteId) => {
  const invite = await RoomInvite.findById(inviteId)
  if (!invite || invite.status !== 'pending') {
    throw new ErrorResponse('Room invite not found.', 404)
  }
  if (invite.recipient !== currentUserId) {
    throw new ErrorResponse('Only the recipient can accept this room invite.', 403)
  }

  const recipient = await resolveUser(currentUserId)
  const room = await gameroomService.addPlayerToGameroom(invite.roomMongoId, {
    userId: currentUserId,
    name: recipient.name || recipient.username || 'Player',
    avatar: recipient.avatar || '',
    type: 'human',
  })

  invite.status = 'accepted'
  await invite.save()
  return { room, invite }
}

const declineRoomInvite = async (currentUserId, inviteId) => {
  const invite = await RoomInvite.findById(inviteId)
  if (!invite || invite.status !== 'pending') {
    throw new ErrorResponse('Room invite not found.', 404)
  }
  if (invite.recipient !== currentUserId && invite.sender !== currentUserId) {
    throw new ErrorResponse('You cannot update this room invite.', 403)
  }

  invite.status = 'declined'
  await invite.save()
  return getSummary(currentUserId)
}

module.exports = {
  getSummary,
  listPlayers,
  updatePresence,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  sendRoomInvite,
  acceptRoomInvite,
  declineRoomInvite,
}
