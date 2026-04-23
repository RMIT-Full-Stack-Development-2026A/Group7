const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const ADMIN_API = {
  // Users
  users:      `${BASE_URL}/admin/users`,
  user:       (id) => `${BASE_URL}/admin/users/${id}`,

  // Game Rooms
  games:      `${BASE_URL}/admin/games`,
  abortGame:  (id) => `${BASE_URL}/admin/games/${id}/abort`,
}

export default ADMIN_API
