import { getApiBaseUrl } from './baseUrl.js'

const BASE_URL = getApiBaseUrl()

export const AUTH_API = {
  baseUrl: BASE_URL,
  users: `${BASE_URL}/users`,
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
}
