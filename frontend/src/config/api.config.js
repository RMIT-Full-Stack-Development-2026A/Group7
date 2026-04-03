const BASE = '';  // Vite proxy handles /auth, /users etc → localhost:5000

export const API = {
  auth: {
    register:  `${BASE}/auth/register`,
    login:     `${BASE}/auth/login`,
    logout:    `${BASE}/auth/logout`,
    me:        `${BASE}/auth/me`,
  },
  users: {
    profile:  (id) => `${BASE}/users/${id}/profile`,
    avatar:   (id) => `${BASE}/users/${id}/avatar`,
    games:    (id) => `${BASE}/users/${id}/games`,
  },
  games: {
    create:   `${BASE}/games`,
    rooms:    `${BASE}/games/rooms`,
    room:     (id) => `${BASE}/games/${id}`,
    join:     (id) => `${BASE}/games/${id}/join`,
    abort:    (id) => `${BASE}/games/${id}/abort`,
    move:     (id) => `${BASE}/games/${id}/move`,
    replay:   (id) => `${BASE}/games/${id}/replay`,
  },
  plans: {
    list:     `${BASE}/plans`,
    get:      (id) => `${BASE}/plans/${id}`,
  },
  subscriptions: {
    purchase: `${BASE}/subscriptions/purchase`,
    my:       `${BASE}/subscriptions/my`,
  },
  admin: {
    users:         `${BASE}/admin/users`,
    user:          (id) => `${BASE}/admin/users/${id}`,
    games:         `${BASE}/admin/games`,
    abortGame:     (roomId) => `${BASE}/admin/games/${roomId}/abort`,
    subscriptions: `${BASE}/admin/subscriptions`,
  },
};
