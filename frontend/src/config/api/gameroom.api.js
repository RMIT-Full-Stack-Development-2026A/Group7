import { getApiBaseUrl } from './baseUrl.js';

const API_BASE_URL = getApiBaseUrl();
const ROOM_BASE_PATH = '/gameroom';

export const gameroomApi = {
  baseUrl: API_BASE_URL,
  roomBasePath: ROOM_BASE_PATH,
  rooms: `${API_BASE_URL}${ROOM_BASE_PATH}`,
  roomById: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/${roomId}`,
  roomByRoomId: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/roomid/${roomId}`,
  roomPlayers: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/${roomId}/players`,
  roomSettings: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/${roomId}/settings`,
  roomStart: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/${roomId}/start`,
  roomPlayer: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/${roomId}/player`,
  roomChat: (roomId) => `${API_BASE_URL}${ROOM_BASE_PATH}/${roomId}/chat`,
};

export const DEFAULT_ROOM_RESPONSE_SHAPE = {
  _id: '',
  roomId: 0,
  roomName: '',
  size: 2,
  host: '',
  players: [],
  gameSettings: {
    boardStyle: 'Classic',
    boardSize: '10x10',
    marker: 'X',
    timeToThink: 240,
    gameMode: 'classic',
  },
  status: 'available',
  createdAt: '',
  updatedAt: '',
};

export default gameroomApi;
