import { httpHelper } from '../../../services/httpHelper'
import { ADMIN_API }  from '../../../config/api/admin.api'

// ─── Users ────────────────────────────────────────────────────────────────────

export const fetchUsers = ({ page = 1, limit = 50, q = '' } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (q) params.set('q', q)
  return httpHelper.get(`${ADMIN_API.users}?${params}`)
}

// accountStatus: 'active' | 'inactive'
export const updateUserStatus = (id, accountStatus) =>
  httpHelper.patch(ADMIN_API.user(id), { accountStatus })

// isPremium: true | false
export const updateUserPremium = (id, isPremium) =>
  httpHelper.patch(ADMIN_API.user(id), { isPremium })

// ─── Game Rooms ───────────────────────────────────────────────────────────────

export const fetchGames = ({ status = '', q = '' } = {}) => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q)      params.set('q', q)
  const qs = params.toString()
  return httpHelper.get(qs ? `${ADMIN_API.games}?${qs}` : ADMIN_API.games)
}

// id = MongoDB _id of the Gameroom document
export const abortGameRoom = (id) =>
  httpHelper.post(ADMIN_API.abortGame(id), {})
