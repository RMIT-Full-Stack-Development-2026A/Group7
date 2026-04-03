# TicTacToang 🎮

Online TicTacToe gaming platform — React + Node/Express + MongoDB + Socket.io

---

## Quick Start (3 commands)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Seed the database with the Gold Data Set
npm run seed

# 3. Start frontend + backend concurrently
npm run dev
```

Frontend → http://localhost:3000  
Backend  → http://localhost:5000

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| MongoDB | ≥ 6 | Must be running locally |
| npm | ≥ 9 | Comes with Node |

Start MongoDB before running the app:
```bash
# macOS/Linux
mongod --dbpath /usr/local/var/mongodb

# Windows (run as Administrator)
mongod

# Or if installed as a service
brew services start mongodb-community   # macOS
sudo systemctl start mongod             # Linux
```

---

## Environment Variables

Copy and fill in the backend env file:
```bash
cp backend/.env.example backend/.env
```

**backend/.env** (defaults work for local dev):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tictactoang
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
SIMULATE_PAYMENT_FAILURE=false
```

---

## Gold Data Set Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tictactoang.com | Admin@1234 |
| Player A (Premium) | playera@tictactoang.com | PlayerA@123 |
| Player B (Standard) | playerb@tictactoang.com | PlayerB@123 |

---

## Running Tests

```bash
npm test
```

This runs:
- **auth.test.js** — unit tests for register, login, logout (mocked DB)
- **subscription.test.js** — integration tests for purchase + idempotency  
  (requires `mongodb-memory-server`; skipped automatically if not installed)

To enable subscription integration tests:
```bash
cd backend
npm install --save-dev mongodb-memory-server
npm test
```

---

## Project Structure

```
tictactoang/
├── package.json              ← root (concurrently dev script)
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── scripts/
│   │   └── seed.js           ← Gold Data Set seeder
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── subscription.test.js
│   └── src/
│       ├── app.js            ← entry point
│       ├── config/
│       │   ├── express.js    ← middleware + route registration
│       │   ├── database.js   ← MongoDB connection
│       │   ├── socket.js     ← Socket.io + game event handlers
│       │   └── tokenStore.js ← in-memory JWT revocation blacklist
│       ├── middleware/
│       │   └── auth.middleware.js   ← authenticate, requireAdmin
│       ├── models/
│       │   ├── User.js
│       │   ├── GameSession.js
│       │   ├── Plan.js
│       │   ├── Subscription.js
│       │   └── Payment.js
│       └── modules/
│           ├── auth/         ← register, login, logout, /me
│           ├── users/        ← profile, avatar, game history
│           ├── game/         ← create, join, move, abort, replay
│           ├── admin/        ← list users/games/subs, ban, abort
│           ├── plans/        ← list plans
│           └── subscription/ ← purchase (simulated payment)
└── frontend/
    ├── vite.config.js        ← proxy to :5000
    └── src/
        ├── config/
        │   └── api.config.js ← all API route constants
        ├── services/
        │   ├── http.js       ← REST helper (GET/POST/PATCH/DELETE)
        │   ├── auth.service.js
        │   ├── game.service.js
        │   ├── subscription.service.js
        │   └── admin.service.js
        ├── hooks/
        │   └── useAuth.jsx   ← AuthContext + useAuth hook
        ├── components/
        │   ├── Navbar.jsx
        │   └── GameBoard.jsx ← reusable 10×10 / 15×15 board
        └── pages/
            ├── Login/        ├── Register/   ├── Dashboard/
            ├── Game/         ├── Premium/    ├── Profile/
            └── Admin/
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Body / Notes |
|--------|----------|------|--------------|
| POST | `/auth/register` | — | `{username, email, password, confirmPassword, country}` |
| POST | `/auth/login` | — | `{usernameOrEmail, password}` → `{token, user}` |
| POST | `/auth/logout` | ✅ | Revokes JWT |
| GET  | `/auth/me` | ✅ | Returns current user |

### Users
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET    | `/users/:id/profile` | ✅ | Own profile or admin |
| PATCH  | `/users/:id/profile` | ✅ | `{username, email, country, password}` |
| POST   | `/users/:id/avatar`  | ✅ | `multipart/form-data` — auto-resized to 200×200 |
| GET    | `/users/:id/games`   | ✅ | Game history |

### Games
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/games` | ✅ | `{gameType: "local"\|"online", player2Name?, boardSize?}` |
| GET  | `/games/rooms` | ✅ | List waiting online rooms |
| GET  | `/games/:roomId` | ✅ | Get room state |
| POST | `/games/:roomId/join` | ✅ | Join an online room |
| POST | `/games/:roomId/abort` | ✅ | Abort (participant only) |
| POST | `/games/:roomId/move` | ✅ | Local game move `{row, col}` |
| GET  | `/games/:roomId/replay` | ✅ | Full move history |

### Plans & Subscriptions
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET  | `/plans` | — | List active plans |
| POST | `/subscriptions/purchase` | ✅ | `{planId, paymentMethod, idempotencyKey?}` |
| GET  | `/subscriptions/my` | ✅ | Current user's active sub |

### Admin (requires admin JWT)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET    | `/admin/users` | `?search=` supported |
| PATCH  | `/admin/users/:id` | `{accountStatus: "active"\|"banned"}` |
| GET    | `/admin/games` | `?status=` supported |
| POST   | `/admin/games/:roomId/abort` | Force-aborts any room |
| GET    | `/admin/subscriptions` | All subscriptions |

### WebSocket Events (Socket.io)

Connect with `{ auth: { token: "<JWT>" } }` to `http://localhost:5000`

**Client → Server:**
| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{roomId}` | Join a game room |
| `choose_mark` | `{roomId, mark}` | Player 2 chooses mark, starts game |
| `make_move` | `{roomId, row, col}` | Place a mark |
| `chat_message` | `{roomId, message}` | Send chat message |

**Server → Client:**
| Event | Payload | Description |
|-------|---------|-------------|
| `room_state` | session object | Current game state on join |
| `player_joined` | `{userId, username}` | Player 2 connected |
| `game_started` | `{mark1, mark2, currentTurn}` | Game begins |
| `move_made` | `{board, currentTurn, row, col, mark}` | Move confirmed |
| `game_over` | `{winner, winLine?, board}` | Game ended |
| `game_aborted` | `{roomId, by}` | Admin or player aborted |
| `chat_message` | `{userId, username, message}` | Chat broadcast |
| `error` | `{message}` | Server error |

---

## HTTP Examples (curl / Postman)

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"Alice@123","confirmPassword":"Alice@123","country":"Vietnam"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"alice","password":"Alice@123"}'

# Purchase subscription (replace TOKEN and USER_ID)
curl -X POST http://localhost:5000/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"planId":"monthly-gold","paymentMethod":"wallet","idempotencyKey":"my-unique-key-001"}'

# List plans
curl http://localhost:5000/plans

# Admin: list users
curl http://localhost:5000/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Admin: ban a user
curl -X PATCH http://localhost:5000/admin/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"accountStatus":"banned"}'
```

---

## Architecture Notes

### N-Tier Layers (Simplex A.1.1 / A.1.2)
Each module follows: **Route → Controller → Service → Model**
- Route: input parsing, validation middleware
- Controller: HTTP in/out, delegates to service
- Service: business logic, DB calls via Mongoose
- Model: Mongoose schema + indexes

### Frontend Layers (A.1.3)
- **Pages** — route-level components
- **Components** — reusable UI (Navbar, GameBoard)
- **Hooks** — `useAuth` for global auth state
- **Services** — API call functions per domain
- **Config** — `api.config.js` groups all backend routes

### Security
- Passwords hashed with **bcryptjs** (cost 12)
- JWTs verified on every protected request
- Logout revokes tokens via **in-memory blacklist** with TTL
- Login blocked after **5 failed attempts** in 60s (express-rate-limit)
- Admin routes protected by **requireAdmin** middleware
- Players cannot access other players' data

### Payment Idempotency
`POST /subscriptions/purchase` accepts an optional `idempotencyKey`.  
If the same key is sent twice, the second call returns the original result without creating duplicate records.  
The payment + subscription + user update are wrapped in a **MongoDB session transaction** — all succeed or all roll back.

---

## Troubleshooting

**MongoDB not running**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
→ Start MongoDB: `mongod` or `brew services start mongodb-community`

**Port already in use**
```
Error: listen EADDRINUSE :::5000
```
→ Kill the process: `lsof -ti:5000 | xargs kill` (macOS/Linux)  
→ Or change `PORT` in `backend/.env`

**Frontend 404 on API calls**
→ Make sure backend is running on port 5000. Vite proxies `/auth`, `/users`, etc. automatically.

**Sharp install fails**
```
npm install --prefix backend
```
→ Sharp requires native binaries. Run: `npm install --prefix backend --ignore-scripts` then `npm rebuild sharp --prefix backend`

**Socket.io connection refused**
→ Ensure `FRONTEND_URL=http://localhost:3000` is set in `backend/.env` (CORS)

**JWT invalid after seed**
→ Log out and log in again — the seeded accounts need a fresh JWT from the login endpoint.
