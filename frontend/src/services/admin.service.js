import http from './http';
import { API } from '../config/api.config';

export async function listUsers(search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const { data } = await http.get(API.admin.users + q);
  return data;
}

export async function updateUserStatus(id, accountStatus) {
  const { data } = await http.patch(API.admin.user(id), { accountStatus });
  return data;
}

export async function listGames(status = '') {
  const q = status ? `?status=${status}` : '';
  const { data } = await http.get(API.admin.games + q);
  return data;
}

export async function adminAbortGame(roomId) {
  const { data } = await http.post(API.admin.abortGame(roomId), {});
  return data;
}

export async function listSubscriptions() {
  const { data } = await http.get(API.admin.subscriptions);
  return data;
}
