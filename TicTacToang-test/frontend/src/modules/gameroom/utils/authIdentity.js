const parseJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

const normalizeIdentity = (source = {}) => ({
  userId: source.id || source._id || source.userId || null,
  name: source.name || source.username || null,
  username: source.username || null,
  avatar: source.avatar || source.avatarUrl || '',
});

export const getStoredAuthIdentity = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('authUser');

  let authUser = null;

  if (storedUser) {
    try {
      authUser = JSON.parse(storedUser);
    } catch {
      authUser = null;
    }
  }

  const normalizedUser = normalizeIdentity(authUser || {});
  if (normalizedUser.userId && (normalizedUser.name || normalizedUser.username)) {
    return normalizedUser;
  }

  const tokenPayload = parseJwtPayload(token);
  const tokenIdentity = {
    userId: tokenPayload?.userId || tokenPayload?.id || null,
    username: tokenPayload?.username || null,
    name: tokenPayload?.name || tokenPayload?.username || null,
    avatar: '',
  };

  return {
    userId: normalizedUser.userId || tokenIdentity.userId,
    name: normalizedUser.name || tokenIdentity.name,
    username: normalizedUser.username || tokenIdentity.username,
    avatar: normalizedUser.avatar || tokenIdentity.avatar,
  };
};

export const resolveAuthIdentity = async () => {
  const token = localStorage.getItem('token');
  const storedIdentity = getStoredAuthIdentity();

  if (storedIdentity.userId && (storedIdentity.name || storedIdentity.username)) {
    return storedIdentity;
  }

  try {
    const profileUrl = storedIdentity.userId
      ? `/api/profile?userId=${encodeURIComponent(storedIdentity.userId)}`
      : '/api/profile';

    const response = await fetch(profileUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return storedIdentity;
    }

    const profileIdentity = normalizeIdentity(payload || {});
    const resolvedIdentity = {
      userId: profileIdentity.userId || storedIdentity.userId,
      name: profileIdentity.name || storedIdentity.name || profileIdentity.username || storedIdentity.username,
      username: profileIdentity.username || storedIdentity.username,
      avatar: profileIdentity.avatar || storedIdentity.avatar || '',
    };

    if (resolvedIdentity.userId || resolvedIdentity.name || resolvedIdentity.username) {
      localStorage.setItem('authUser', JSON.stringify({
        id: resolvedIdentity.userId,
        name: resolvedIdentity.name,
        username: resolvedIdentity.username,
        avatar: resolvedIdentity.avatar,
      }));
    }

    return resolvedIdentity;
  } catch {
    return storedIdentity;
  }
};
