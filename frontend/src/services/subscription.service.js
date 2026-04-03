import http from './http';
import { API } from '../config/api.config';

export async function listPlans() {
  const { data } = await http.get(API.plans.list);
  return data;
}

export async function purchase(payload) {
  const { data } = await http.post(API.subscriptions.purchase, payload);
  return data;
}

export async function mySubscription() {
  const { data } = await http.get(API.subscriptions.my);
  return data;
}
