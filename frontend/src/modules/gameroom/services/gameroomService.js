import gameroomApi from '../../../config/api/gameroom.api.js';
import { getStoredAuthIdentity } from '../utils/authIdentity.js';

const defaultGameSettings = {
  boardStyle: 'Classic',
  boardSize: '10x10',
  marker: 'X',
  timeToThink: 240,
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

const withCurrentUser = (body = {}) => {
  const identity = getStoredAuthIdentity();

  return {
    ...body,
    userId: body.userId || identity.userId || undefined,
    username: body.username || identity.username || undefined,
    email: body.email || identity.email || undefined,
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

const normalizeStartPayload = (payload) => {
  if (!payload?.room) {
    return {
      room: normalizeRoomPayload(payload),
      gameSession: null,
    };
  }

  return {
    ...payload,
    room: normalizeRoomPayload(payload.room),
  };
};

export const gameroomService = {
  async listRooms() {
    const rooms = await fetch(gameroomApi.rooms).then(parseJsonResponse);
    return Array.isArray(rooms) ? rooms.map(normalizeRoomPayload) : [];
  },

  async createRoom(roomData) {
    const room = await fetch(
      gameroomApi.rooms,
      buildJsonRequest('POST', withCurrentUser(roomData)),
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
      buildJsonRequest('PATCH', withCurrentUser({ players })),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async addPlayerToRoom(roomId, playerData) {
    const room = await fetch(
      gameroomApi.roomPlayer(roomId),
      buildJsonRequest('POST', withCurrentUser({ playerData })),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async removeCurrentPlayerFromRoom(roomId) {
    const room = await fetch(
      gameroomApi.roomPlayer(roomId),
      buildJsonRequest('DELETE', withCurrentUser()),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async updateRoomSettings(roomId, gameSettings) {
    const room = await fetch(
      gameroomApi.roomSettings(roomId),
      buildJsonRequest('PATCH', withCurrentUser({ gameSettings })),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },

  async startRoom(roomId, players) {
    const payload = await fetch(
      gameroomApi.roomStart(roomId),
      buildJsonRequest('POST', withCurrentUser(players ? { players } : {})),
    ).then(parseJsonResponse);

    return normalizeStartPayload(payload);
  },

  async getRoomChatMessages(roomId) {
    const messages = await fetch(gameroomApi.roomChat(roomId)).then(parseJsonResponse);
    return Array.isArray(messages) ? messages : [];
  },

  async sendRoomChatMessage(roomId, messageData) {
    return fetch(
      gameroomApi.roomChat(roomId),
      buildJsonRequest('POST', withCurrentUser(messageData)),
    ).then(parseJsonResponse);
  },

  async deleteRoom(roomId) {
    const room = await fetch(
      gameroomApi.roomById(roomId),
      buildJsonRequest('DELETE', withCurrentUser()),
    ).then(parseJsonResponse);

    return normalizeRoomPayload(room);
  },
};

export default gameroomService;
