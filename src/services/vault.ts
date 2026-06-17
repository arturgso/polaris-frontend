import { BEATRIZ_PERSON_ID } from '../constants';
import type {
  Gift,
  GiftFilters,
  NewGiftDTO,
  UpdateGiftDTO,
  VaultGiftItem,
  VaultGiftList,
  GiftList,
} from '../types';
import { api } from './api';
import {
  saveVaultSession,
  clearVaultSession,
  hasVaultSession as hasVaultSessionLocal,
} from './vaultSession';

function notifyVaultChanged() {
  window.dispatchEvent(new Event('polaris:vault-changed'));
}

export async function unlockVault(password: string) {
  const { data } = await api.post<{ token: string }>('/vault/unlock', { password });
  saveVaultSession(data.token, password);
  return true;
}

export function lockVault() {
  clearVaultSession();
}

export function hasVaultSession() {
  return hasVaultSessionLocal();
}

export function isBeatrizPerson(personId?: number) {
  return personId === BEATRIZ_PERSON_ID;
}

export async function getVaultGiftLists(): Promise<VaultGiftList[]> {
  const { data } = await api.get<GiftList[]>('/vault/gift-lists');
  return data.map((list) => ({
    id: list.id,
    name: list.title,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }));
}

export async function getVaultGiftItems(filters: GiftFilters = {}, giftListId?: number): Promise<VaultGiftItem[]> {
  const [listsRes, giftsRes] = await Promise.all([
    api.get<GiftList[]>('/vault/gift-lists'),
    api.get<Gift[]>('/vault/gifts', { params: filters }),
  ]);

  const rawLists = listsRes.data;
  const gifts = giftsRes.data;

  const giftListIdMap = new Map<number, number>();
  for (const list of rawLists) {
    if (list.gifts) {
      for (const gift of list.gifts) {
        giftListIdMap.set(gift.id, list.id);
      }
    }
  }

  const mappedItems: VaultGiftItem[] = gifts.map((gift) => ({
    id: gift.id,
    title: gift.title,
    link: gift.link,
    event: gift.event,
    status: gift.status,
    giftListId: giftListIdMap.get(gift.id),
    createdAt: gift.createdAt,
    updatedAt: gift.updatedAt,
  }));

  if (giftListId !== undefined) {
    return mappedItems.filter((item) => (giftListId === 0 ? !item.giftListId : item.giftListId === giftListId));
  }

  return mappedItems;
}

export async function createVaultGiftList(name: string): Promise<VaultGiftList> {
  const { data } = await api.post<GiftList>('/gift-lists', { title: name.trim() });
  await api.patch(`/gift-lists/${data.id}/vault`);
  notifyVaultChanged();
  return {
    id: data.id,
    name: data.title,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateVaultGiftList(listId: number, name: string) {
  await api.patch(`/gift-lists/${listId}`, { title: name.trim() });
  notifyVaultChanged();
}

export async function deleteVaultGiftList(listId: number) {
  await api.delete(`/gift-lists/${listId}`);
  notifyVaultChanged();
}

export async function createVaultGiftItem(payload: NewGiftDTO & { giftListId?: number }) {
  const { data } = await api.post<Gift>('/gifts', {
    title: payload.title,
    link: payload.link || undefined,
    personId: BEATRIZ_PERSON_ID,
    event: payload.event || undefined,
    status: payload.status || undefined,
  });

  await api.patch(`/gifts/${data.id}/vault`);

  if (payload.giftListId) {
    await api.patch(`/gifts/${data.id}`, {
      giftListId: payload.giftListId,
    });
  }

  notifyVaultChanged();

  return {
    id: data.id,
    title: data.title,
    link: data.link,
    event: data.event,
    status: data.status,
    giftListId: payload.giftListId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateVaultGiftItem(itemId: number, payload: UpdateGiftDTO & { giftListId?: number }) {
  await api.patch(`/gifts/${itemId}`, {
    title: payload.title,
    link: payload.link || undefined,
    giftListId: payload.giftListId,
    event: payload.event || undefined,
    status: payload.status || undefined,
  });
  notifyVaultChanged();
}

export async function deleteVaultGiftItem(itemId: number) {
  await api.delete(`/gifts/${itemId}`);
  notifyVaultChanged();
}

export async function createGiftForBeatriz(payload: NewGiftDTO): Promise<Gift> {
  const item = await createVaultGiftItem(payload);
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    giftFor: 'Beatriz',
    event: item.event,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function moveGiftToVault(giftId: number) {
  await api.patch(`/gifts/${giftId}/vault`);
  notifyVaultChanged();
}
