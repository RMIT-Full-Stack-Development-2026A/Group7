import http from './http';
import { API } from '../config/api.config';

export async function createGame(payload) {
  const { data } = await http.post(API.games.create, payload);
  return data;
}

export async function listRooms() {
  const { data } = await http.get(API.games.rooms);
  return data;
}

export async function getRoom(roomId) {
  const { data } = await http.get(API.games.room(roomId));
  return data;
}

export async function joinRoom(roomId) {
  const { data } = await http.post(API.games.join(roomId), {});
  return data;
}

export async function abortGame(roomId) {
  const { data } = await http.post(API.games.abort(roomId), {});
  return data;
}

export async function makeLocalMove(roomId, row, col) {
  const { data } = await http.post(API.games.move(roomId), { row, col });
  return data;
}

export async function getReplay(roomId) {
  const { data } = await http.get(API.games.replay(roomId));
  return data;
}
