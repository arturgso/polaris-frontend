import { api } from './api';
import type { NewListDTO, ShoppingList } from '../types';

export async function getShoppingLists() {
  const { data } = await api.get<ShoppingList[]>('/shopping-lists');

  return data;
}

export async function getShoppingList(listId: number) {
  const { data } = await api.get<ShoppingList>(`/shopping-lists/${listId}`);

  return data;
}

export async function createShoppingList(payload: NewListDTO) {
  const { data } = await api.post<ShoppingList>('/shopping-lists', payload);

  return data;
}

export async function updateShoppingList(listId: number, payload: NewListDTO) {
  await api.patch(`/shopping-lists/${listId}`, payload);
}

export async function deleteShoppingList(listId: number) {
  await api.delete(`/shopping-lists/${listId}`);
}
