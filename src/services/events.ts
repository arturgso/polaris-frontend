import { api } from '@/services/api';
import type { Event, NewEventDTO } from '@/types';

export async function getEvents() {
  const { data } = await api.get<Event[]>('/events');

  return data;
}

export async function createEvent(payload: NewEventDTO) {
  const { data } = await api.post<Event>('/events', payload);

  return data;
}
