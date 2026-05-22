import { httpHelper } from '../../../services/httpHelper'
import { AUTH_API }   from '../../../config/api/auth.api'

export const loginPlayer = async ({ identifier, password }) =>
  httpHelper.post(AUTH_API.login, {
    identifier: identifier.trim(),
    password: password.trim(),
  })

// Best-effort backend logout. Swallows errors so the client-side logout still
// completes (clears localStorage, navigates) even if the server is unreachable.
export const logoutPlayer = async () => {
  try {
    return await httpHelper.post(AUTH_API.logout, {})
  } catch (error) {
    return { ok: false, data: null, error }
  }
}
