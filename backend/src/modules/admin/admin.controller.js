// ─── Admin Controller ────────────────────────────────────────────────────────
// Merged from admin-authentication branch.
// Fixed for app-test module structure and field naming conventions:
//   - app-test model uses `accountStatus` ('active'|'inactive'), not `isActive`
//   - app-test model uses `isPremium`, not `premiumStatus`
//   - app-test model uses `password`, not `passwordHash`
//   - "Games" in admin context = Gamerooms (the rooms players create)
// ─────────────────────────────────────────────────────────────────────────────

const User     = require('../../modules/auth/auth.model')      // app-test path
const Gameroom = require('../../modules/gameroom/gameroom.model') // app-test path
const { ErrorResponse } = require('../../shared/errors/AppErrors')

// Helper: get the socket.io instance from the gameroom socket module
// Returns null safely if socket hasn't been initialised yet
function getIO() {
  try { return require('../../socket/gameroom.socket').getIO() }
  catch { return null }
}

// ─── GET /api/admin/users?q=&page=1&limit=50 ──────────────────────────────
async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 50, q } = req.query
    const filter = {}
    if (q) {
      filter.$or = [
        { username: new RegExp(q, 'i') },
        { email:    new RegExp(q, 'i') },
      ]
    }

    const users = await User.find(filter)
      .select('-password -failedLoginAttempts -lockUntil') // never expose sensitive fields
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .lean()

    const total = await User.countDocuments(filter)

    res.json({
      ok: true,
      data: users,
      meta: { page: Number(page), limit: Number(limit), total },
    })
  } catch (err) { next(err) }
}

// ─── PATCH /api/admin/users/:id ───────────────────────────────────────────
// Whitelisted fields only — prevents privilege escalation through this endpoint.
// FIX: uses app-test field names (`accountStatus`, `isPremium`) not admin-branch names.
async function patchUser(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    // Only allow fields that are intentionally managed from the admin panel.
    const ALLOWED_FIELDS = ['name', 'accountStatus', 'isPremium', 'subscriptionEndDate', 'timeoutUntil']
    const payload = {}
    ALLOWED_FIELDS.forEach((k) => { if (k in updates) payload[k] = updates[k] })

    // Validate accountStatus value if provided
    if (payload.accountStatus && !['active', 'inactive'].includes(payload.accountStatus)) {
      return res.status(400).json({ ok: false, error: 'accountStatus must be "active" or "inactive"' })
    }

    if (payload.name !== undefined && (typeof payload.name !== 'string' || payload.name.trim().length < 3)) {
      return res.status(400).json({ ok: false, error: 'name must be at least 3 characters' })
    }

    if (payload.name !== undefined) payload.name = payload.name.trim()

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ ok: false, error: 'No valid fields to update' })
    }

    const user = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .select('-password -failedLoginAttempts -lockUntil')
      .lean()

    if (!user) return res.status(404).json({ ok: false, error: 'User not found' })

    res.json({ ok: true, data: user })
  } catch (err) { next(err) }
}

// ─── GET /api/admin/games?status= ─────────────────────────────────────────
// FIX: lists Gamerooms (not GameSession) — that is what app-test tracks.
// Gameroom statuses: 'available' | 'full' | 'in-battle' | 'completed'
async function getGames(req, res, next) {
  try {
    const { status, q } = req.query
    const filter = {}

    if (status) filter.status = status

    // Search by numeric roomId or player name
    if (q) {
      const asNumber = Number(q)
      if (!Number.isNaN(asNumber) && q.trim() !== '') {
        filter.roomId = asNumber
      } else {
        filter.$or = [
          { roomName: new RegExp(q, 'i') },
          { 'players.name': new RegExp(q, 'i') },
        ]
      }
    }

    const rooms = await Gameroom.find(filter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean()

    res.json({ ok: true, data: rooms })
  } catch (err) { next(err) }
}

// ─── POST /api/admin/games/:id/abort ──────────────────────────────────────
// FIX: aborts a Gameroom by MongoDB _id (not roomNumber).
// Emits socket event through app-test's /gameroom namespace so connected players are notified.
async function abortGame(req, res, next) {
  try {
    const { id } = req.params // MongoDB _id of the Gameroom document

    const room = await Gameroom.findById(id)
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' })
    }

    if (room.status === 'completed') {
      return res.status(400).json({ ok: false, error: 'Room is already completed' })
    }

    room.status = 'completed'
    if (!room.endedAt) {
      room.endedAt = new Date()
    }
    await room.save()

    // Notify all players in the room via Socket.io
    const io = getIO()
    if (io) {
      // app-test uses /gameroom namespace and room:${roomId} channels
      io.of('/gameroom')
        .to(`room:${room.roomId}`)
        .emit('room-closed-by-admin', {
          roomId:  room.roomId,
          message: 'This room has been closed by an admin.',
        })
    }

    res.json({
      ok: true,
      message: `Room ${room.roomId} has been aborted`,
      roomId: room.roomId,
    })
  } catch (err) { next(err) }
}

module.exports = { getUsers, patchUser, getGames, abortGame }
