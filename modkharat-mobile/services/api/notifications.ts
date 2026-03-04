import { get, patch } from './client';
import type { NotificationItem } from '@/types/models';

interface NotificationListResponse {
  data: NotificationItem[];
}

export async function listNotifications() {
  return get<NotificationListResponse>('/v1/notifications');
}

export async function markRead(id: string) {
  return patch(`/v1/notifications/${id}/read`);
}

export async function markAllRead() {
  return patch('/v1/notifications/read-all');
}
