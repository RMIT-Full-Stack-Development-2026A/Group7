// Pure helpers for the Match Replay page. No React, no side effects.

export const SPEED_OPTIONS = [
  { label: '0.5x', valueMs: 2400 },
  { label: '1x', valueMs: 1200 },
  { label: '1.5x', valueMs: 800 },
  { label: '2x', valueMs: 500 },
];

export const SYMBOL_COLORS = {
  X: '#60a5fa',
  O: '#f472b6',
  P1: '#60a5fa',
  P2: '#f472b6',
  P3: '#facc15',
};

const FALLBACK_COLOR = '#cbd5f5';
const A_CODE = 'a'.charCodeAt(0);

export const columnLetter = (index) => String.fromCharCode(A_CODE + index);

export const buildEmptyBoard = (size) =>
  Array.from({ length: size }, () => Array(size).fill(null));

export const reconstructBoardAtStep = (moves, step, size) => {
  const board = buildEmptyBoard(size);
  const limit = Math.min(step, moves.length);
  for (let i = 0; i < limit; i += 1) {
    const move = moves[i];
    if (move && Number.isInteger(move.row) && Number.isInteger(move.col)) {
      board[move.row][move.col] = move.player;
    }
  }
  return board;
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

export const resolveSymbolColor = (symbol, participants) => {
  if (!symbol) return FALLBACK_COLOR;
  const participant = participants?.find(
    (entry) => entry?.playerSymbol === symbol || entry?.marker === symbol,
  );
  return participant?.markerColor || SYMBOL_COLORS[symbol] || FALLBACK_COLOR;
};

const slotPlayer = (player, symbol, fallbackOrder) => ({
  id: player.playerId || symbol.toLowerCase(),
  name: player.playerName || `Player ${symbol}`,
  avatar: player.avatar || '',
  symbol,
  isAI: Boolean(player.isAI),
  order: fallbackOrder,
});

export const buildParticipantList = (replay) => {
  const participants = replay?.participants;
  if (Array.isArray(participants) && participants.length > 0) {
    return participants.map((entry, index) => ({
      id: entry.playerId || `participant-${index}`,
      name: entry.playerName || `Player ${index + 1}`,
      avatar: entry.avatar || '',
      symbol: entry.playerSymbol || entry.marker || `P${index + 1}`,
      isAI: Boolean(entry.isAI),
      order: entry.order || index + 1,
    }));
  }

  const fallback = [];
  if (replay?.players?.X) fallback.push(slotPlayer(replay.players.X, 'X', 1));
  if (replay?.players?.O) fallback.push(slotPlayer(replay.players.O, 'O', 2));
  return fallback;
};

export const isPremiumIdentity = (identity) =>
  Boolean(identity?.isPremium || identity?.premiumStatus);
