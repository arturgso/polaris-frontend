import { Gift, ShoppingBag } from 'lucide-vue-next';
import type { DashboardCardProps } from '@/types';

export const dashboardGiftCardMock: DashboardCardProps[] = [
  {
    id: 2,
    icon: Gift,
    title: 'itens em presentes',
    info: '6',
    bottomInfo: 'total cadastrados',
  },
  {
    id: 4,
    icon: ShoppingBag,
    title: 'Total presentes',
    info: 'R$ 2.780,80',
    bottomInfo: 'soma estimada',
  },
];
