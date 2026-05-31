import { api } from '@/services/api';
import type { Gift, NewGiftDTO, UpdateGiftDTO } from '@/types';

export async function getGiftsByPerson(personId: number) {
  const { data } = await api.get<Gift[]>(`/gifts/${personId}`);

  return data;
}

export async function createGift(payload: NewGiftDTO) {
  const { data } = await api.post<Gift>('/gifts', payload);

  return data;
}

export async function updateGift(giftId: number, payload: UpdateGiftDTO) {
  await api.patch(`/gifts/${giftId}`, payload);
}

export async function deleteGift(giftId: number) {
  await api.delete(`/gifts/${giftId}`);
}
