// Pure helpers + constants for the GameSessionHistory component.

export const HISTORY_LIMIT = 100;

export const DEFAULT_FILTERS = {
  search: '',
  result: '',
  gameType: '',
  playerCount: '',
  dateFrom: '',
  dateTo: '',
  sort: 'desc',
};

export const RESULT_OPTIONS = [
  { value: '', label: 'All results' },
  { value: 'win', label: 'Win' },
  { value: 'loss', label: 'Lose' },
  { value: 'draw', label: 'Draw' },
  { value: 'aborted', label: 'Aborted' },
];

export const GAME_TYPE_OPTIONS = [
  { value: '', label: 'All game types' },
  { value: 'singleplayer', label: 'Singleplayer' },
  { value: 'local', label: 'Local' },
  { value: 'online', label: 'Online' },
];

export const PLAYER_COUNT_OPTIONS = [
  { value: '', label: 'Any player count' },
  { value: '2', label: '2 Players' },
  { value: '3', label: '3 Players' },
  { value: '4', label: '4 Players' },
];

export const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
];

export const getResultClasses = (resultLabel) => {
  if (resultLabel === 'Victory') return 'match-history-result-victory border-emerald-400/20 bg-emerald-500/10 text-emerald-300';
  if (resultLabel === 'Defeat') return 'match-history-result-defeat border-rose-400/20 bg-rose-500/10 text-rose-300';
  if (resultLabel === 'Aborted') return 'match-history-result-aborted border-slate-400/20 bg-slate-500/10 text-slate-200';
  return 'match-history-result-draw border-amber-400/20 bg-amber-500/10 text-amber-200';
};

export const formatDateTime = (value) => {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Duration unavailable';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes <= 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
};

export const getMatchParticipants = (match) => {
  if (Array.isArray(match.participants) && match.participants.length > 0) {
    return match.participants;
  }
  return [match.player, match.opponent].filter(Boolean).map((participant, index) => ({
    ...participant,
    userId: participant.userId || participant.id,
    order: index + 1,
    marker: participant.symbol,
  }));
};
