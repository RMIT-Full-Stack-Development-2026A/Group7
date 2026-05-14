import { getApiBaseUrl } from './baseUrl.js'

const BASE_URL = getApiBaseUrl()

export const ADMIN_API = {
  users: `${BASE_URL}/admin/users`,
  user: (id) => `${BASE_URL}/admin/users/${id}`,
  games: `${BASE_URL}/admin/games`,
  abortGame: (id) => `${BASE_URL}/admin/games/${id}/abort`,
}
