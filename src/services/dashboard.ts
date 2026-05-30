import { api } from '@/services/api';
import type { DashboardMetricsDTO, ShoppingItem } from '@/types';

export async function getDashboardMetrics() {
  const { data } = await api.get<DashboardMetricsDTO>('/dashboard/metrics');

  return data;
}

export async function getRecentShoppingItems() {
  const { data } = await api.get<ShoppingItem[]>('/dashboard/recent-shopping-items');

  return data;
}
