const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const AUTH_API = {
  baseUrl: BASE_URL,
  users: `${BASE_URL}/users`,
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
}
