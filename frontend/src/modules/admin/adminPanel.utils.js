// Pure helpers for the AdminPanel page.

export const getPlayerId = (player) => player?._id || player?.id;

export const getPlayerName = (player) =>
  player?.name || player?.username || player?.email || 'Unnamed player';

export const getTimeoutTime = (player) => {
  if (!player?.timeoutUntil) return 0;
  const time = new Date(player.timeoutUntil).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

export const getRoomHumanPlayers = (room) => {
  const players = Array.isArray(room?.players) ? room.players : [];
  return players.filter((player) => player?.type !== 'ai');
};

export const getRoomPlayerLabel = (room, index) => {
  const human = getRoomHumanPlayers(room);
  return human[index]?.name
    || (Array.isArray(room?.players) ? room.players[index]?.name : '')
    || '—';
};

export const STATUS_LABELS = {
  available: 'Waiting',
  full: 'Full',
  'in-battle': 'In battle',
  completed: 'Completed',
};

export const STATUS_BADGE_STYLES = {
  available: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  full: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  'in-battle': 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  completed: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
};
