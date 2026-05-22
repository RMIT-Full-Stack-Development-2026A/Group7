// In-process JWT deny-list used to revoke tokens on logout.
// Suitable for a single backend instance (this project's deployment model).
// For multi-instance deployments swap in a Redis or DB-backed store with the
// same shape — the rest of the auth module only depends on { revoke, isRevoked }.

const revokedTokens = new Map()
let lastSweepAt = 0
const SWEEP_INTERVAL_MS = 60_000

const sweepExpired = () => {
  const now = Date.now()
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return
  lastSweepAt = now
  for (const [token, expiresAt] of revokedTokens) {
    if (expiresAt && expiresAt <= now) {
      revokedTokens.delete(token)
    }
  }
}

const revoke = (token, expiresAtMs) => {
  if (!token || typeof token !== 'string') return
  sweepExpired()
  const expiresAt = Number.isFinite(expiresAtMs) ? expiresAtMs : 0
  revokedTokens.set(token, expiresAt)
}

const isRevoked = (token) => {
  if (!token || typeof token !== 'string') return false
  sweepExpired()
  if (!revokedTokens.has(token)) return false
  const expiresAt = revokedTokens.get(token)
  if (expiresAt && expiresAt <= Date.now()) {
    revokedTokens.delete(token)
    return false
  }
  return true
}

const size = () => {
  sweepExpired()
  return revokedTokens.size
}

const clear = () => revokedTokens.clear()

module.exports = {
  revoke,
  isRevoked,
  size,
  clear,
}
