import { useEffect } from 'react';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';

const PRESENCE_INTERVAL_MS = 15 * 1000;
const PRESENCE_URL = `${getApiBaseUrl()}/social/presence`;

const sendPresence = (online, { keepalive = false } = {}) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  fetch(PRESENCE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ online }),
    keepalive,
  }).catch(() => {});
};

export const usePresenceHeartbeat = () => {
  useEffect(() => {
    const heartbeat = () => sendPresence(true);
    const markOffline = () => sendPresence(false, { keepalive: true });

    heartbeat();

    const intervalId = window.setInterval(heartbeat, PRESENCE_INTERVAL_MS);
    window.addEventListener('focus', heartbeat);
    document.addEventListener('visibilitychange', heartbeat);
    window.addEventListener('beforeunload', markOffline);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', heartbeat);
      document.removeEventListener('visibilitychange', heartbeat);
      window.removeEventListener('beforeunload', markOffline);
    };
  }, []);
};
