// Pure helpers for the Main Menu page. No React, no side effects.

export const emptySocialSummary = {
  friends: [],
  requests: [],
  roomInvites: [],
  players: [],
};

export const shuffleItems = (items = []) => [...items].sort(() => Math.random() - 0.5);

export const formatTabBadgeCount = (count) => {
  const normalized = Number(count) || 0;
  return normalized > 99 ? '99+' : String(normalized);
};

export const getSocialSectionCounts = (summary = emptySocialSummary) => ({
  friends: Array.isArray(summary.friends) ? summary.friends.length : 0,
  alerts: Array.isArray(summary.roomInvites) ? summary.roomInvites.length : 0,
  requests: Array.isArray(summary.requests) ? summary.requests.length : 0,
});

export const getOtherPlayers = (players = []) =>
  players.filter((player) => player.friendshipStatus !== 'friend');

export const getPresenceMeta = (player) => {
  if (player.accountStatus === 'inactive') return 'Unavailable';
  if (player.accountStatus === 'timeout') return 'Timed out';
  return player.isOnline ? 'Online' : 'Offline';
};

export const formatRelativeTime = (value) => {
  const time = new Date(value).getTime();
  if (!time || Number.isNaN(time)) return 'Just now';
  const seconds = Math.max(1, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const getPlayerButtonLabel = (player) => {
  if (player.friendshipStatus === 'friend') return 'Friends';
  if (player.friendshipStatus === 'pending') return 'Pending';
  return 'Add Friend';
};

export const canSendFriendRequest = (player) => player.friendshipStatus === 'none';

export const getRecentMatchParticipants = (match) => {
  if (Array.isArray(match?.participants) && match.participants.length > 0) {
    return match.participants;
  }
  return [match?.player, match?.opponent].filter(Boolean).map((participant, index) => ({
    ...participant,
    userId: participant.userId || participant.id,
    order: index + 1,
    marker: participant.symbol,
  }));
};

export const SUSPENSION_MESSAGE = 'Your account is in suspension, cannot use this feature.';

export const SUSPENDED_ALLOWED_TABS = new Set(['friends']);
