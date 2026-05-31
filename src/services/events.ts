import { api } from '@/services/api';
import type { Event } from '@/types';

export async function getEvents() {
  const { data } = await api.get<Event[]>('/events');

  return data;
}
