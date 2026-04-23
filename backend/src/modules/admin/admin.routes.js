// ─── Admin Routes ─────────────────────────────────────────────────────────────
// FIX: uses app-test's existing middleware:
//   1. `authenticate`   → verifies JWT, attaches req.user
//   2. `authorizeAdmin` → checks req.user.role === 'admin'
// Both must run in sequence. The admin branch's role.middleware.js did its own
// JWT verification, bypassing `authenticate` — that pattern doesn't match app-test.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express')
const { authenticate }   = require('../../middleware/authMiddleware')  // app-test path
const { authorizeAdmin } = require('../../middleware/roleMiddleware')   // app-test path
const adminController    = require('./admin.controller')

const router = express.Router()

// All admin routes: authenticate first (validate JWT), then authorizeAdmin (check role)
router.use(authenticate, authorizeAdmin)

// Users
router.get('/users',         adminController.getUsers)   // GET  /api/admin/users?q=&page=&limit=
router.patch('/users/:id',   adminController.patchUser)  // PATCH /api/admin/users/:id

// Game Rooms
router.get('/games',              adminController.getGames)  // GET  /api/admin/games?status=&q=
router.post('/games/:id/abort',   adminController.abortGame) // POST /api/admin/games/:id/abort

module.exports = router
