import { api } from './api';
import type { GiftList, NewListDTO } from '../types';

export async function getGiftLists() {
  const { data } = await api.get<GiftList[]>('/gift-lists');

  return data;
}

export async function getGiftList(listId: number) {
  const { data } = await api.get<GiftList>(`/gift-lists/${listId}`);

  return data;
}

export async function createGiftList(payload: NewListDTO) {
  const { data } = await api.post<GiftList>('/gift-lists', payload);

  return data;
}

export async function updateGiftList(listId: number, payload: NewListDTO) {
  await api.patch(`/gift-lists/${listId}`, payload);
}

export async function deleteGiftList(listId: number) {
  await api.delete(`/gift-lists/${listId}`);
}
