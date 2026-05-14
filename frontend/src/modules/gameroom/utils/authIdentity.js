import { getApiBaseUrl } from '../../../config/api/baseUrl.js';

const API_BASE_URL = getApiBaseUrl();

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
  email: source.email || null,
  avatar: source.avatar || source.avatarUrl || '',
  role: source.role || null,
  isPremium: source.isPremium,
  premiumStatus: source.premiumStatus,
});

export const getStoredAuthIdentity = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('authUser');
  const tokenPayload = parseJwtPayload(token);
  const tokenIdentity = {
    userId: tokenPayload?.userId || tokenPayload?.id || null,
    username: tokenPayload?.username || null,
    name: tokenPayload?.name || tokenPayload?.username || null,
    email: tokenPayload?.email || null,
    avatar: '',
    role: tokenPayload?.role || null,
  };

  let authUser = null;

  if (storedUser) {
    try {
      authUser = JSON.parse(storedUser);
    } catch {
      authUser = null;
    }
  }

  const normalizedUser = normalizeIdentity(authUser || {});

  return {
    userId: tokenIdentity.userId || normalizedUser.userId,
    name: normalizedUser.name || tokenIdentity.name,
    username: normalizedUser.username || tokenIdentity.username,
    email: normalizedUser.email || tokenIdentity.email,
    avatar: normalizedUser.avatar || tokenIdentity.avatar,
    role: normalizedUser.role || tokenIdentity.role,
    isPremium: normalizedUser.isPremium,
    premiumStatus: normalizedUser.premiumStatus,
  };
};

export const resolveAuthIdentity = async () => {
  const token = localStorage.getItem('token');
  const storedIdentity = getStoredAuthIdentity();

  const persistIdentity = (identity) => {
    if (identity.userId || identity.name || identity.username) {
      localStorage.setItem('authUser', JSON.stringify({
        id: identity.userId,
        name: identity.name,
        username: identity.username,
        email: identity.email,
        avatar: identity.avatar,
        role: identity.role,
        isPremium: identity.isPremium,
        premiumStatus: identity.premiumStatus,
      }));
    }
  };

  try {
    const usersResponse = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const usersPayload = await usersResponse.json().catch(() => []);
    const users = Array.isArray(usersPayload) ? usersPayload : usersPayload?.data || [];
    const matchedUser = users.find((user) => (
      (storedIdentity.userId && String(user._id || user.id) === String(storedIdentity.userId))
      || (storedIdentity.username && user.username === storedIdentity.username)
      || (storedIdentity.email && user.email === storedIdentity.email)
    ));

    if (matchedUser) {
      const resolvedIdentity = normalizeIdentity(matchedUser);
      persistIdentity(resolvedIdentity);
      return resolvedIdentity;
    }
  } catch {
    // Fall through to profile/stored identity.
  }

  try {
    const profileUrl = storedIdentity.userId
      ? `${API_BASE_URL}/profile?userId=${encodeURIComponent(storedIdentity.userId)}`
      : `${API_BASE_URL}/profile`;

    const response = await fetch(profileUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const payload = await response.json().catch(() => null);

    if (response.ok) {
      const profileIdentity = normalizeIdentity(payload || {});
      const profileLooksLikeRequestedUser = !storedIdentity.username || profileIdentity.username === storedIdentity.username;

      if (profileLooksLikeRequestedUser) {
        const resolvedIdentity = {
          userId: profileIdentity.userId || storedIdentity.userId,
          name: profileIdentity.name || storedIdentity.name || profileIdentity.username || storedIdentity.username,
          username: profileIdentity.username || storedIdentity.username,
          email: profileIdentity.email || storedIdentity.email,
          avatar: profileIdentity.avatar || storedIdentity.avatar || '',
          role: profileIdentity.role || storedIdentity.role,
          isPremium: profileIdentity.isPremium ?? storedIdentity.isPremium,
          premiumStatus: profileIdentity.premiumStatus ?? storedIdentity.premiumStatus,
        };

        persistIdentity(resolvedIdentity);
        return resolvedIdentity;
      }
    }
  } catch {
    // Keep the best local identity if the network is unavailable.
  }

  return storedIdentity;
};
