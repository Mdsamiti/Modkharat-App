import * as notifRepo from '../repositories/notifications.js';
import type { NotificationDTO } from '../types/api.js';

const ICON_MAP: Record<string, { icon: string; iconColor: string; bgColor: string }> = {
  budget: { icon: 'alert-circle', iconColor: '#f59e0b', bgColor: '#fef3c7' },
  goal: { icon: 'target', iconColor: '#10b981', bgColor: '#d1fae5' },
  unusual: { icon: 'trending-up', iconColor: '#ef4444', bgColor: '#fee2e2' },
  system: { icon: 'info', iconColor: '#3b82f6', bgColor: '#dbeafe' },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toDTO(row: notifRepo.NotificationRow): NotificationDTO {
  const style = ICON_MAP[row.type] ?? ICON_MAP.system;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    time: timeAgo(row.created_at),
    read: row.read_at !== null,
    icon: (row.metadata as any)?.icon ?? style.icon,
    iconColor: (row.metadata as any)?.iconColor ?? style.iconColor,
    bgColor: (row.metadata as any)?.bgColor ?? style.bgColor,
    link: (row.metadata as any)?.link ?? null,
  };
}

export async function listNotifications(userId: string): Promise<NotificationDTO[]> {
  const rows = await notifRepo.findNotificationsByUser(userId);
  return rows.map(toDTO);
}

export async function markRead(id: string, userId: string): Promise<void> {
  await notifRepo.markRead(id, userId);
}

export async function markAllRead(userId: string): Promise<void> {
  await notifRepo.markAllRead(userId);
}
