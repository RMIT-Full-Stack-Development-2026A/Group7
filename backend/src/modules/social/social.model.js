const mongoose = require('mongoose')

const userSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { _id: false }
)

const friendRequestSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true, index: true },
    recipient: { type: String, required: true, index: true },
    requesterSnapshot: userSnapshotSchema,
    recipientSnapshot: userSnapshotSchema,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true, collection: 'friend_requests' }
)

friendRequestSchema.index(
  { requester: 1, recipient: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
)

const friendshipSchema = new mongoose.Schema(
  {
    users: { type: [String], required: true, index: true },
    userA: { type: String, required: true, index: true },
    userB: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: 'friendships' }
)

friendshipSchema.index({ userA: 1, userB: 1 }, { unique: true })

const roomInviteSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true, index: true },
    recipient: { type: String, required: true, index: true },
    senderSnapshot: userSnapshotSchema,
    recipientSnapshot: userSnapshotSchema,
    roomMongoId: { type: String, required: true },
    roomId: { type: Number, required: true },
    roomName: { type: String, default: 'Game Room' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true, collection: 'room_invites' }
)

roomInviteSchema.index(
  { sender: 1, recipient: 1, roomMongoId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
)

const FriendRequest = mongoose.models.FriendRequest || mongoose.model('FriendRequest', friendRequestSchema)
const Friendship = mongoose.models.Friendship || mongoose.model('Friendship', friendshipSchema)
const RoomInvite = mongoose.models.RoomInvite || mongoose.model('RoomInvite', roomInviteSchema)

module.exports = {
  FriendRequest,
  Friendship,
  RoomInvite,
}
