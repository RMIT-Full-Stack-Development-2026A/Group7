// Pure helpers for the Profile page.
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js';

export const AVATAR_MAX_SIZE = 512;
export const AVATAR_QUALITY = 0.82;

export function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleString();
}

export const buildProfileFromStoredIdentity = () => {
  const identity = getStoredAuthIdentity();
  if (!identity?.userId && !identity?.username && !identity?.email) return null;
  return {
    userId: identity.userId || identity.id || '',
    name: identity.name || identity.username || 'Player',
    username: identity.username || '',
    email: identity.email || '',
    country: identity.country || '',
    role: identity.role || 'player',
    premiumStatus: Boolean(identity.premiumStatus ?? identity.isPremium),
    subscriptionEndDate: identity.subscriptionEndDate || null,
    isActive: true,
    avatarUrl: identity.avatar || '',
    createdAt: null,
  };
};

export const resizeAvatarFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, AVATAR_MAX_SIZE / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not prepare avatar image.'));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', AVATAR_QUALITY));
    };
    image.onerror = () => reject(new Error('Could not load avatar image.'));
    image.src = typeof reader.result === 'string' ? reader.result : '';
  };

  reader.onerror = () => reject(new Error('Failed to read that image file.'));
  reader.readAsDataURL(file);
});
