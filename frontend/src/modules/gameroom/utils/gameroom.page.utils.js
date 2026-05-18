// Pure helpers for the Gameroom page hook.
import { AI_AVATAR, getRawAvatarValue } from '../../../shared/utils/avatar.utils.js';
import { isSafeMarker } from '../../../shared/utils/marker.utils.js';
import ROUTES from '../../../router/routes.config.js';

export const HOST_APPROVAL_SECONDS = 10;

export const buildEmptyPlayers = () => [null, null, null, null];

export const getActiveSlotIndices = (size) => {
  if (size === 2) return [0, 2];
  if (size === 3) return [0, 2, 3];
  return [0, 1, 2, 3];
};

const getHumanSlotName = (slotIndex, isHostPlayer = false) =>
  (isHostPlayer ? 'Host' : `p${slotIndex + 1}`);
const getAISlotName = (slotIndex) => `AI-${slotIndex + 1}`;
const isLegacySlotLabel = (value = '') => /^p\d+$/i.test(String(value).trim());

const resolveHumanPlayerIdentity = (player, slotIndex, isHostPlayer, authIdentity) => {
  const isCurrentUser = Boolean(
    authIdentity?.userId && player?.userId && String(authIdentity.userId) === String(player.userId)
  );
  return {
    name: player?.name
      || (isCurrentUser ? (authIdentity.name || authIdentity.username) : null)
      || getHumanSlotName(slotIndex, isHostPlayer),
    avatar: player?.avatar
      || player?.avatarUrl
      || (isCurrentUser ? authIdentity.avatar : '')
      || '',
  };
};

const buildSlotEntry = (player, slotIndex, hostUserId, authIdentity) => {
  const isHostPlayer = hostUserId && String(player?.userId) === hostUserId;
  const humanIdentity = player?.type === 'ai'
    ? null
    : resolveHumanPlayerIdentity(player, slotIndex, Boolean(isHostPlayer), authIdentity);
  const normalizedAIName = getAISlotName(slotIndex);
  const normalizedHumanName = player?.name && !isLegacySlotLabel(player.name)
    ? player.name
    : (humanIdentity?.name || getHumanSlotName(slotIndex, Boolean(isHostPlayer)));
  return {
    id: slotIndex + 1,
    name: player?.type === 'ai' ? normalizedAIName : normalizedHumanName,
    avatar: player?.type === 'ai'
      ? (player?.avatar || AI_AVATAR)
      : (humanIdentity?.avatar || ''),
    isHost: Boolean(isHostPlayer),
    type: player.type || 'human',
    aiDifficulty: player.aiDifficulty,
    userId: player?.userId,
    marker: player?.marker || '',
    markerColor: player?.markerColor || '',
  };
};

export const mapRoomPlayersToSlots = (room, authIdentity = null) => {
  const nextPlayers = buildEmptyPlayers();
  const activeSlots = getActiveSlotIndices(Number(room?.size) || 4);
  const roomPlayers = Array.isArray(room?.players) ? room.players : [];
  const hostUserId = room?.host ? String(room.host) : null;

  const hostSlotIndex = activeSlots[0];
  const guestSlotIndices = activeSlots.slice(1);
  const hostPlayer = hostUserId
    ? roomPlayers.find((player) => String(player?.userId) === hostUserId)
    : null;
  const guestPlayers = roomPlayers.filter((player) => String(player?.userId) !== hostUserId);

  if (hostPlayer) {
    nextPlayers[hostSlotIndex] = buildSlotEntry(hostPlayer, hostSlotIndex, hostUserId, authIdentity);
  }
  guestPlayers.forEach((player, index) => {
    const slotIndex = guestSlotIndices[index];
    if (slotIndex !== undefined) {
      nextPlayers[slotIndex] = buildSlotEntry(player, slotIndex, hostUserId, authIdentity);
    }
  });

  return nextPlayers;
};

export const mapSlotsToRoomPlayers = (players, room) => {
  const activeSlots = getActiveSlotIndices(Number(room?.size) || 4);
  const hostUserId = room?.host ? String(room.host) : null;

  return activeSlots
    .map((slotIndex) => {
      const player = players[slotIndex];
      if (!player) return null;

      const isHostPlayer = Boolean(
        (player.userId && hostUserId && String(player.userId) === hostUserId) || player.isHost,
      );

      return {
        userId: player.userId
          || (player.type === 'ai' ? `ai_slot_${slotIndex + 1}` : (isHostPlayer ? room.host : null)),
        name: player.type === 'ai'
          ? getAISlotName(slotIndex)
          : ((player.name && !isLegacySlotLabel(player.name))
            ? player.name
            : getHumanSlotName(slotIndex, isHostPlayer)),
        avatar: player.type === 'ai'
          ? getRawAvatarValue(player.avatar || AI_AVATAR)
          : getRawAvatarValue(player.avatar),
        type: player.type || 'human',
        marker: isSafeMarker(player.marker) ? player.marker : '',
        markerColor: player.markerColor || '',
        ...(player.aiDifficulty ? { aiDifficulty: player.aiDifficulty } : {}),
      };
    })
    .filter(Boolean);
};

export const normalizeRoomPlayersForSync = (players = []) =>
  players.map((player) => ({
    userId: player.userId,
    name: player.name,
    avatar: getRawAvatarValue(player.avatar),
    type: player.type || 'human',
    marker: isSafeMarker(player.marker) ? player.marker : '',
    markerColor: player.markerColor || '',
    ...(player.aiDifficulty ? { aiDifficulty: player.aiDifficulty } : {}),
  }));

const normalizeSlotsForCompare = (players = []) =>
  players.map((player) => (
    player ? {
      id: player.id,
      name: player.name,
      avatar: getRawAvatarValue(player.avatar),
      isHost: Boolean(player.isHost),
      type: player.type || 'human',
      aiDifficulty: player.aiDifficulty || '',
      userId: player.userId || '',
      marker: player.marker || '',
      markerColor: player.markerColor || '',
    } : null
  ));

export const arePlayerSlotsEqual = (currentPlayers, nextPlayers) =>
  JSON.stringify(normalizeSlotsForCompare(currentPlayers))
    === JSON.stringify(normalizeSlotsForCompare(nextPlayers));

const normalizeRoomForCompare = (room) => {
  if (!room) return null;
  return {
    id: String(room._id || room.id || ''),
    roomId: String(room.roomId || ''),
    host: String(room.host || ''),
    size: Number(room.size) || 0,
    status: room.status || '',
    gameSettings: room.gameSettings || {},
    players: normalizeRoomPlayersForSync(room.players || []),
  };
};

export const areRoomPayloadsEqual = (currentRoom, nextRoom) =>
  JSON.stringify(normalizeRoomForCompare(currentRoom))
    === JSON.stringify(normalizeRoomForCompare(nextRoom));

export const getAISlotNameForIndex = getAISlotName;

export const buildAISlot = (slotIndex, difficulty) => ({
  id: slotIndex + 1,
  name: getAISlotName(slotIndex),
  avatar: AI_AVATAR,
  isHost: false,
  type: 'ai',
  aiDifficulty: difficulty,
  marker: '',
  markerColor: '',
});

export const buildLocalPlayerSlot = (slotIndex, rawName) => ({
  id: slotIndex + 1,
  name: String(rawName || '').trim().slice(0, 30),
  avatar: '',
  isHost: false,
  type: 'human',
  userId: `local_player_${slotIndex + 1}`,
  marker: '',
  markerColor: '',
});

export const isRemovableSlot = (player) => {
  if (!player || player.isHost) return false;
  return player.type === 'ai'
    || (player.type === 'human' && typeof player.userId === 'string' && player.userId.startsWith('local_player_'));
};

export const buildGameStartPayload = (room, roomPlayers, returnToRoute) => {
  const settings = room?.gameSettings || {};
  const rawBoardSize = typeof settings.boardSize === 'number'
    ? settings.boardSize
    : Number(String(settings.boardSize || '10').match(/(?:^|\D)(10|15)(?=\D|$)/)?.[1] || 10);
  const normalizedBoardSize = rawBoardSize === 15 ? 15 : 10;
  const aiPlayer = roomPlayers.find((player) => player?.type === 'ai');
  const hasHumanOpponent = roomPlayers.filter(Boolean).some((player) => player?.type !== 'ai' && !player?.isHost);
  const shouldUseSingleplayerRoute = Boolean(aiPlayer) && roomPlayers.length === 2;

  return {
    route: shouldUseSingleplayerRoute ? ROUTES.VS_COMPUTER : ROUTES.VS_FRIEND,
    state: {
      roomId: room?.roomId,
      roomDbId: room?._id,
      boardSize: normalizedBoardSize,
      timeControl: settings.timeToThink || 60,
      aiDifficulty: aiPlayer?.aiDifficulty || 'medium',
      returnTo: ROUTES.GAMEROOM,
      roomState: { createdRoom: room, returnTo: returnToRoute },
      hasHumanOpponent,
    },
  };
};

// Validate that the current slot configuration is allowed to start.
// Returns `null` if startable, otherwise the human-readable reason.
export const validateStartGame = (players) => {
  const active = players.filter(Boolean);
  if (active.length < 2) return 'Add one more player or AI before starting the game.';
  if (active.some((player) => !isSafeMarker(player.marker))) {
    return 'Every player must choose a marker before starting the game.';
  }
  if (!active.some((player) => player.type !== 'ai')) {
    return 'At least one human player is required to start the game.';
  }
  return null;
};
