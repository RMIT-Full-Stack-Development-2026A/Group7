import { Navigate, useLocation } from 'react-router-dom'
import ROUTES from './routes.config.js'
import { Forbidden403 } from '../modules/startingpage/pages/Forbidden403.jsx'
import { getStoredAuthIdentity } from '../modules/gameroom/utils/authIdentity.js'

const normalizeRoles = (input) => {
  if (!input) return []
  if (Array.isArray(input)) return input.map((role) => String(role || '').toLowerCase())
  return [String(input).toLowerCase()]
}

export function RequireRole({ role, roles, children }) {
  const location = useLocation()
  const allowedRoles = normalizeRoles(roles || role)
  const identity = getStoredAuthIdentity()
  const hasToken = Boolean(typeof window !== 'undefined' && window.localStorage?.getItem('token'))

  if (!hasToken) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  const viewerRole = String(identity?.role || '').toLowerCase()
  const isAuthorized = allowedRoles.length === 0 || allowedRoles.includes(viewerRole)

  if (!isAuthorized) {
    return (
      <Forbidden403
        title="Admin access required"
        message="You do not have permission to view the admin control center. Only administrators can access this area."
      />
    )
  }

  return children
}

export default RequireRole
