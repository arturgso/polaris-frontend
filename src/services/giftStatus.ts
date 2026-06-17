import { getGiftStatuses as getGiftStatusesFromMetadata } from './statuses';
import type { GiftStatus } from '@/types';

export async function getGiftStatuses(): Promise<GiftStatus[]> {
  const statuses = await getGiftStatusesFromMetadata();

  return statuses.map((status) => ({
    id: status.id,
    value: status.value,
    name: status.name,
    color: status.color,
  }));
}
