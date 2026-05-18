// DTO + display helpers for the /games/user/history list view.

const AI_ID_PATTERN = /^ai[_-]/i;
const DIFFICULTY_ANNOTATION_PATTERN = /\((?:easy|medium|hard)\)\s*$/i;

const inferIsAI = ({ explicitIsAI, playerId }) => {
  if (explicitIsAI === true) return true;
  if (explicitIsAI === false) return false;
  return AI_ID_PATTERN.test(String(playerId || ''));
};

const formatPlayerDisplayName = ({ name, isAI, difficulty }) => {
  const baseName = String(name || '').trim() || 'Player';
  if (!isAI || !difficulty) return baseName;
  if (DIFFICULTY_ANNOTATION_PATTERN.test(baseName)) return baseName;
  return `${baseName} (${difficulty})`;
};

const isLocalPlaceholderId = (id) => String(id || '').startsWith('local_player_');
const isAIId = (id) => String(id || '').startsWith('ai_');

const isRealHuman = (entry) => {
  if (!entry) return false;
  if (entry.isAI) return false;
  const id = entry.playerId;
  if (!id) return false;
  return !(isLocalPlaceholderId(id) || isAIId(id));
};

const buildParticipantsList = (game) => {
  if (Array.isArray(game.participants) && game.participants.length > 0) {
    return game.participants;
  }
  return [
    {
      playerId: game.players.X.playerId,
      playerName: game.players.X.playerName,
      avatar: game.players.X.avatar || '',
      playerSymbol: 'X',
      marker: 'X',
      order: 1,
      isAI: game.players.X.isAI,
      aiDifficulty: game.players.X.aiDifficulty,
    },
    {
      playerId: game.players.O.playerId,
      playerName: game.players.O.playerName,
      avatar: game.players.O.avatar || '',
      playerSymbol: 'O',
      marker: 'O',
      order: 2,
      isAI: game.players.O.isAI,
      aiDifficulty: game.players.O.aiDifficulty,
    },
  ];
};

const resolveResultLabel = ({ status, winner, isPlayerX, isPlayerO, currentParticipantSymbol, isKnownPlayer }) => {
  if (status === 'abandoned') return 'Aborted';
  if (winner === 'draw') return 'Draw';
  if (!isKnownPlayer) return 'Unknown';
  const viewerWon = (isPlayerX && winner === 'X')
    || (isPlayerO && winner === 'O')
    || (currentParticipantSymbol && winner === currentParticipantSymbol);
  return viewerWon ? 'Victory' : 'Defeat';
};

const resolveGameType = (game, participants, viewerId) => {
  const humanIds = new Set();
  if (isRealHuman(game.players.X)) humanIds.add(String(game.players.X.playerId));
  if (isRealHuman(game.players.O)) humanIds.add(String(game.players.O.playerId));
  for (const participant of participants) {
    if (isRealHuman(participant)) humanIds.add(String(participant.playerId));
  }
  const viewerIdString = viewerId ? String(viewerId) : null;
  const opponents = viewerIdString
    ? Array.from(humanIds).filter((id) => id !== viewerIdString)
    : Array.from(humanIds);
  const hasRealOpponent = opponents.length >= 1;
  const hasAIPlayer = Boolean(game.players.X.isAI)
    || Boolean(game.players.O.isAI)
    || isAIId(game.players.X.playerId)
    || isAIId(game.players.O.playerId)
    || participants.some((p) => Boolean(p?.isAI) || isAIId(p?.playerId));

  if (hasRealOpponent) return { label: 'Online', className: 'online' };
  if (hasAIPlayer) return { label: 'Singleplayer', className: 'singleplayer' };
  return { label: 'Local', className: 'local' };
};

const buildParticipantEntry = (participant, index, game, currentUserId) => {
  const participantSymbol = participant.playerSymbol || participant.marker || `P${index + 1}`;
  const matchedBySymbol = participantSymbol === 'X' ? game.players.X
    : participantSymbol === 'O' ? game.players.O
    : null;
  const matchedById = participant.playerId
    ? (String(game.players.X.playerId) === String(participant.playerId) ? game.players.X
      : String(game.players.O.playerId) === String(participant.playerId) ? game.players.O
      : null)
    : null;
  const slotPlayer = matchedBySymbol || matchedById;
  const resolvedIsAI = inferIsAI({
    explicitIsAI: participant.isAI === true ? true : (slotPlayer ? slotPlayer.isAI : participant.isAI),
    playerId: participant.playerId || slotPlayer?.playerId,
  });
  const resolvedDifficulty = resolvedIsAI ? (participant.aiDifficulty || slotPlayer?.aiDifficulty || null) : null;
  return {
    id: participant.playerId,
    userId: participant.playerId,
    name: formatPlayerDisplayName({
      name: participant.playerName || slotPlayer?.playerName,
      isAI: resolvedIsAI,
      difficulty: resolvedDifficulty,
    }),
    avatar: participant.avatar || '',
    symbol: participantSymbol,
    marker: participant.marker || participant.playerSymbol || `P${index + 1}`,
    order: participant.order || index + 1,
    isAI: resolvedIsAI,
    aiDifficulty: resolvedDifficulty,
    isCurrentUser: String(participant.playerId) === String(currentUserId),
  };
};

const mapHistoryGame = (game, currentUserId) => {
  const isPlayerX = String(game.players.X.playerId) === String(currentUserId);
  const isPlayerO = String(game.players.O.playerId) === String(currentUserId);
  const participants = buildParticipantsList(game);
  const currentParticipant = participants.find((p) => String(p.playerId) === String(currentUserId));
  const currentParticipantSymbol = currentParticipant?.playerSymbol || currentParticipant?.marker;
  const isKnownPlayer = isPlayerX || isPlayerO || Boolean(currentParticipant);
  const player = isPlayerX ? game.players.X : game.players.O;
  const opponent = isPlayerX ? game.players.O : game.players.X;
  const winner = game.result?.winner;
  const resultLabel = resolveResultLabel({
    status: game.status,
    winner,
    isPlayerX,
    isPlayerO,
    currentParticipantSymbol,
    isKnownPlayer,
  });
  const gameType = resolveGameType(game, participants, currentUserId);
  const playerCount = participants.length || 2;
  const playerTwo = participants.find((p) => Number(p.order) === 2) || participants[1] || game.players.O;

  return {
    gameId: game.gameId,
    sessionNumber: game.gameId,
    status: game.status,
    gameMode: game.gameMode,
    gameType: gameType.label,
    gameClass: gameType.className,
    playerCount,
    playerTwoName: playerTwo?.playerName || '',
    boardSize: game.boardSize,
    result: game.result,
    resultLabel,
    player: {
      id: player.playerId,
      name: formatPlayerDisplayName({
        name: player.playerName,
        isAI: inferIsAI({ explicitIsAI: player.isAI, playerId: player.playerId }),
        difficulty: player.aiDifficulty,
      }),
      avatar: player.avatar || '',
      symbol: isPlayerX ? 'X' : 'O',
      isAI: inferIsAI({ explicitIsAI: player.isAI, playerId: player.playerId }),
    },
    opponent: {
      id: opponent.playerId,
      name: formatPlayerDisplayName({
        name: opponent.playerName,
        isAI: inferIsAI({ explicitIsAI: opponent.isAI, playerId: opponent.playerId }),
        difficulty: opponent.aiDifficulty,
      }),
      avatar: opponent.avatar || '',
      symbol: isPlayerX ? 'O' : 'X',
      isAI: inferIsAI({ explicitIsAI: opponent.isAI, playerId: opponent.playerId }),
    },
    participants: participants
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((p, index) => buildParticipantEntry(p, index, game, currentUserId)),
    startedAt: game.startedAt,
    completedAt: game.completedAt,
    totalMoves: game.result?.totalMoves ?? game.moves.length,
    duration: game.duration,
  };
};

class GameHistoryListDTO {
  constructor(games, currentUserId, pagination) {
    this.games = games.map((game) => mapHistoryGame(game, currentUserId));
    this.pagination = pagination;
  }

  toJSON() {
    return { games: this.games, pagination: this.pagination };
  }
}

module.exports = {
  GameHistoryListDTO,
};
