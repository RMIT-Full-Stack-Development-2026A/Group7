import http from './http';
import { API } from '../config/api.config';

export async function register(payload) {
  const { data } = await http.post(API.auth.register, payload);
  return data;
}

export async function login(payload) {
  const { data } = await http.post(API.auth.login, payload);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function logout() {
  try { await http.post(API.auth.logout, {}); } catch { /* best-effort */ }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function getMe() {
  const { data } = await http.get(API.auth.me);
  return data;
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export function getToken() {
  return localStorage.getItem('token');
}
