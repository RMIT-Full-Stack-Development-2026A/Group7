const revoked = new Map(); // token -> expiry timestamp

function revokeToken(token, ttlSeconds) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  revoked.set(token, expiresAt);
}

function isRevoked(token) {
  const exp = revoked.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    revoked.delete(token);
    return false;
  }
  return true;
}

module.exports = { revokeToken, isRevoked };
