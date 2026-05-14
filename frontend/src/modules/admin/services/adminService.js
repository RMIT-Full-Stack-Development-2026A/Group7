import { httpHelper } from '../../../services/httpHelper'
import { ADMIN_API } from '../../../config/api/admin.api'

const normalizeUsersPayload = (payload, fallbackMeta = {}) => {
  const users = Array.isArray(payload) ? payload : payload?.data || []
  const meta = Array.isArray(payload)
    ? { page: 1, limit: users.length, total: users.length }
    : payload?.meta || fallbackMeta

  return {
    ok: true,
    data: users,
    meta,
  }
}

export const fetchUsers = ({ page = 1, limit = 50, q = '' } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (q) params.set('q', q)
  return httpHelper.get(`${ADMIN_API.users}?${params}`)
}

export const fetchAllUsers = async ({ q = '', limit = 200 } = {}) => {
  const first = await fetchUsers({ page: 1, limit, q })
  if (!first.ok) return first

  const payload = normalizeUsersPayload(first.data)
  const users = [...(payload.data || [])]
  const total = payload.meta?.total || users.length
  const pageCount = Math.ceil(total / limit)

  for (let page = 2; page <= pageCount; page += 1) {
    const response = await fetchUsers({ page, limit, q })
    if (!response.ok) return response
    users.push(...(response.data.data || []))
  }

  return {
    ...first,
    data: {
      ...payload,
      data: users,
      meta: { ...(payload.meta || {}), page: 1, limit: users.length || limit, total },
    },
  }
}

export const updateUser = (id, updates) =>
  httpHelper.patch(ADMIN_API.user(id), updates)

export const updateUserStatus = (id, accountStatus) =>
  updateUser(id, { accountStatus })

export const updateUserPremium = (id, isPremium) =>
  updateUser(id, { isPremium })

export const fetchGames = ({ status = '', q = '' } = {}) => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const qs = params.toString()
  return httpHelper.get(qs ? `${ADMIN_API.games}?${qs}` : ADMIN_API.games)
}

export const abortGameRoom = (id) =>
  httpHelper.post(ADMIN_API.abortGame(id), {})
