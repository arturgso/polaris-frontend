import { api } from './api';
import type { StatusesDTO } from '@/types';

let statusesPromise: Promise<StatusesDTO> | null = null;

async function fetchStatuses() {
  const { data } = await api.get<StatusesDTO>('/statuses');
  return data;
}

export async function getStatuses() {
  if (!statusesPromise) {
    statusesPromise = fetchStatuses().catch((error) => {
      statusesPromise = null;
      throw error;
    });
  }

  return statusesPromise;
}

export async function getGiftStatuses() {
  const statuses = await getStatuses();
  return statuses.giftStatus;
}

export async function getShoppingItemStatuses() {
  const statuses = await getStatuses();
  return statuses.shoppingItemsStatus;
}
