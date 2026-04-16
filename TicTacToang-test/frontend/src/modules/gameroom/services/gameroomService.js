import gameroomApi from '../../../config/api/gameroom.api.js';

const defaultGameSettings = {
  boardStyle: 'Classic',
  boardSize: '10x10',
  marker: 'X-O',
  timeToThink: 60,
  gameMode: 'classic',
};

const buildJsonRequest = (method, body) => {
  const token = localStorage.getItem('token');

  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
};

const parseJsonResponse = async (response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Gameroom request failed');
  }

  return payload?.data ?? payload;
};

const normalizeRoomPayload = (room) => {
  if (!room) {
    return room;
  }

  return {
    ...room,
    gameSettings: {
      ...defaultGameSettings,
      ...(room.gameSettings || {}),
    },
    players: Array.isArray(room.players) ? room.players : [],
  };
};

export const gameroomService = {
  async createRoom(roomData) {
    const room = await fetch(
      gameroomApi.rooms,
      buildJsonRequest('POST', roomData),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async getRoomById(roomId) {
    const room = await fetch(gameroomApi.roomById(roomId)).then(parseJsonResponse);
    return normalizeRoomPayload(room);
  },

  async getRoomByRoomId(roomId) {
    const room = await fetch(gameroomApi.roomByRoomId(roomId)).then(parseJsonResponse);
    return normalizeRoomPayload(room);
  },

  async updateRoomPlayers(roomId, players) {
    const room = await fetch(
      gameroomApi.roomPlayers(roomId),
      buildJsonRequest('PATCH', { players }),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async updateRoomSettings(roomId, gameSettings) {
    const room = await fetch(
      gameroomApi.roomSettings(roomId),
      buildJsonRequest('PATCH', gameSettings),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async startRoom(roomId) {
    const room = await fetch(
      gameroomApi.roomStart(roomId),
      buildJsonRequest('POST'),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },
};

export default gameroomService;
