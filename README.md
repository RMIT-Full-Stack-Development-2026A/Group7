# Group7 — TicTacToang (Gomoku)

Full-stack 5-in-a-row game (React + Vite frontend, Node + Express + MongoDB backend, socket.io realtime, PayPal subscription).

## Repository

https://github.com/RMIT-Full-Stack-Development-2026A/Group7

## Test credentials

### Seeded user accounts

| Role   | Email                       | Password     |
| ------ | --------------------------- | ------------ |
| Admin  | admin@tictactoang.com       | Admin@1234   |
| Player | playera@tictactoang.com     | PlayerA@123  |
| Player | playerb@tictactoang.com     | PlayerB@123  |

`PlayerA` is seeded as premium (used for Match Replay testing).

### PayPal sandbox (Subscription page)

- Email: `sb-cwpya51157136@personal.example.com`
- Password: `DP8!p3z2`

## Run the website

Requires Node.js 22+ and a running MongoDB connection string in `backend/.env` (see `MONGODB_URI`).

```bash
npm install
node index.js
```

```MongoDB_URL
mongodb+srv://s4102871:Qhrmit1201%40@group7-tictactoang.vhg6rft.mongodb.net/
```

The backend starts on `http://localhost:4000`. To use the React UI in dev mode, run the frontend in a second terminal:

```bash
npm --workspace frontend run dev
```

Open `http://localhost:3000`.


Testing with another PC without the needs of the same network:
 
```bash
npm run tunnel
```


## Render Cloud
- Backend: `https://tictactoang-backend.onrender.com`
- Frontend: `https://tictactoang-frontend.onrender.com`

## Contribution Table

| Member Name      | Student ID | Role               | Assigned Tasks                                           | Score |
| ---------------- | ---------- | ------------------ | ---------------------------------------------------------| ----- |
| Le Bao Quang Huy | s4102871   | PM / Tech Lead     | Gameroom, Subscription, Join Match logic, set up git repo| 5     |
| Tran Minh Nghia  | s4123236   | Developer          | Admin                                                    | 5     |
| Tran Gia Khanh   | s4041377   | Developer          | Profile, Starting Page                                   | 5     |
| Nguyen Thanh Dat | s3830318   | Developer          | Login, Registration, Online Game                         | 5     |
| Pham Cao Khiem   | s4026150   | Developer          | AI Logic, Local Player, Single Player                    | 5     |

Total: 25 (5 members × 5).


## Report Contribution:
    1.	Introduction – Nghia
    2.	Project description  
    2.1 Khanh 
    2.2, 2.3 Nghia
    3.	Implementation details: 
    3.1 3.2 Figures Huy
    3.1 3.2 Contents Khiem
    3.3 UI Nghia
    3.4 Khiem
    3.5 Huy
    3.6.1 Dat 
    3.6.2 Nghia
    3.7 Khanh
    4.	Evaluation - Huy
    5.	Conclusion - Dat

## Project Structure
```
Group7/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cors.js
│   │   │   └── db.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── accountStatusMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── bruteForce.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── validateMiddleware.js
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.repository.js
│   │   │   │   ├── auth.model.js
│   │   │   │   └── auth.validator.js
│   │   │   │
│   │   │   ├── game/
│   │   │   │   ├── game.routes.js
│   │   │   │   ├── game.controller.js
│   │   │   │   ├── game.service.js
│   │   │   │   ├── game.repository.js
│   │   │   │   ├── game.model.js
│   │   │   │   ├── WinDetection.js
│   │   │   │   └── game.helpers.js
│   │   │   │
│   │   │   ├── gameroom/
│   │   │   │   ├── gameroom.routes.js
│   │   │   │   ├── gameroom.controller.js
│   │   │   │   ├── gameroom.service.js
│   │   │   │   ├── gameroom.repository.js
│   │   │   │   ├── gameroom.model.js
│   │   │   │   └── gameroom.validator.js
│   │   │   │
│   │   │   ├── profile/
│   │   │   ├── admin/
│   │   │   ├── social/
│   │   │   └── AILogic/
│   │   │
│   │   ├── services/
│   │   │   ├── email.service.js
│   │   │   └── paypal.service.js
│   │   │
│   │   ├── shared/
│   │   │   ├── errors/
│   │   │   └── utils/
│   │   │
│   │   ├── socket/
│   │   │   └── gameroom.socket.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api/
│   │   │
│   │   ├── router/
│   │   │   ├── RouterConfig.jsx
│   │   │   └── routes.config.js
│   │   │
│   │   ├── services/
│   │   │   └── httpHelper.js
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   ├── utils/
│   │   │   └── assets/
│   │   │
│   │   ├── modules/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── gameroom/
│   │   │   ├── gameboard/
│   │   │   ├── startingpage/
│   │   │   ├── admin/
│   │   │   └── social/
│   │   │
│   │   ├── AppShell.jsx
│   │   └── main.jsx
│   │
│   └── package.json
└── package.json
```
