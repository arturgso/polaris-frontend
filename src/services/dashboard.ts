import { api } from './api';
import type { DashboardMetricsDTO } from '../types/Dashboard';
import type { ShoppingItem } from '../types/ShoppingList';

export async function getDashboardMetrics() {
  const { data } = await api.get<DashboardMetricsDTO>('/dashboard/metrics');

  return data;
}

export async function getRecentShoppingItems() {
  const { data } = await api.get<ShoppingItem[]>('/dashboard/recent-shopping-items');

  return data;
}
