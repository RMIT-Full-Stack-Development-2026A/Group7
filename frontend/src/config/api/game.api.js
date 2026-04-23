import { httpHelper } from '../../services/httpHelper.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const GAME_API = {
  baseUrl: API_BASE_URL,
  games: `${API_BASE_URL}/games`,
  localHistory: `${API_BASE_URL}/games/local-history`,
  gameById: (gameId) => `${API_BASE_URL}/games/${gameId}`,
  gameMove: (gameId) => `${API_BASE_URL}/games/${gameId}/move`,
  gameAIMove: (gameId) => `${API_BASE_URL}/games/${gameId}/ai-move`,
  gameResign: (gameId) => `${API_BASE_URL}/games/${gameId}/resign`,
  gameReplay: (gameId) => `${API_BASE_URL}/games/${gameId}/replay`,
}

export const gameAPI = {
  createGame: (payload, timeoutMs) => httpHelper.post(GAME_API.games, payload, undefined, timeoutMs),
  saveLocalHistory: (payload, timeoutMs) => httpHelper.post(GAME_API.localHistory, payload, undefined, timeoutMs),
  makeMove: (gameId, payload, timeoutMs) => httpHelper.post(GAME_API.gameMove(gameId), payload, undefined, timeoutMs),
  makeAIMove: (gameId, timeoutMs) => httpHelper.post(GAME_API.gameAIMove(gameId), {}, undefined, timeoutMs),
  resignGame: (gameId) => httpHelper.post(GAME_API.gameResign(gameId), {}),
  getGame: (gameId) => httpHelper.get(GAME_API.gameById(gameId)),
  getGameReplay: (gameId) => httpHelper.get(GAME_API.gameReplay(gameId)),
}

export default gameAPI
