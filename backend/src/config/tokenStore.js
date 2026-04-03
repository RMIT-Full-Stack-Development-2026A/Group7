// In-memory token blacklist with TTL cleanup.
// Replace with Redis for multi-instance deployments.
const blacklist = new Map(); // token -> expiresAt (ms)

function revoke(token, expiresAt) {
  blacklist.set(token, expiresAt);
  const ttl = expiresAt - Date.now();
  if (ttl > 0) setTimeout(() => blacklist.delete(token), ttl);
}

function isRevoked(token) {
  if (!blacklist.has(token)) return false;
  if (blacklist.get(token) < Date.now()) { blacklist.delete(token); return false; }
  return true;
}

module.exports = { revoke, isRevoked };
