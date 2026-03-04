import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the repository
vi.mock('../repositories/notifications.js', () => ({
  findNotificationsByUser: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
}));

import * as notifService from './notifications.js';
import * as notifRepo from '../repositories/notifications.js';

const mockFindNotifications = notifRepo.findNotificationsByUser as ReturnType<typeof vi.fn>;
const mockMarkRead = notifRepo.markRead as ReturnType<typeof vi.fn>;
const mockMarkAllRead = notifRepo.markAllRead as ReturnType<typeof vi.fn>;

const USER_ID = 'user-123';
const OTHER_USER_ID = 'user-456';

function makeNotificationRow(overrides: Partial<any> = {}) {
  return {
    id: 'notif-1',
    user_id: USER_ID,
    household_id: 'hh-1',
    type: 'budget',
    title: 'Budget Alert',
    message: 'Shopping budget at 82%',
    metadata: {},
    read_at: null,
    created_at: new Date(Date.now() - 3600 * 1000), // 1 hour ago
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Notification service — listNotifications', () => {
  it('returns DTOs mapped from repository rows', async () => {
    mockFindNotifications.mockResolvedValue([
      makeNotificationRow(),
      makeNotificationRow({ id: 'notif-2', type: 'goal', read_at: new Date() }),
    ]);

    const result = await notifService.listNotifications(USER_ID);

    expect(mockFindNotifications).toHaveBeenCalledWith(USER_ID);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'notif-1',
      type: 'budget',
      title: 'Budget Alert',
      read: false,
      icon: 'alert-circle',
    });
    expect(result[1]).toMatchObject({
      id: 'notif-2',
      type: 'goal',
      read: true,
      icon: 'target',
    });
  });

  it('returns empty array when user has no notifications', async () => {
    mockFindNotifications.mockResolvedValue([]);

    const result = await notifService.listNotifications(USER_ID);
    expect(result).toEqual([]);
  });

  it('uses icon/color from metadata when available', async () => {
    mockFindNotifications.mockResolvedValue([
      makeNotificationRow({
        type: 'system',
        metadata: { icon: 'custom-icon', iconColor: '#000', bgColor: '#fff' },
      }),
    ]);

    const result = await notifService.listNotifications(USER_ID);
    expect(result[0].icon).toBe('custom-icon');
    expect(result[0].iconColor).toBe('#000');
    expect(result[0].bgColor).toBe('#fff');
  });
});

describe('Notification service — markRead', () => {
  it('calls repo markRead with correct userId scope', async () => {
    mockMarkRead.mockResolvedValue(true);

    await notifService.markRead('notif-1', USER_ID);

    expect(mockMarkRead).toHaveBeenCalledWith('notif-1', USER_ID);
    expect(mockMarkRead).toHaveBeenCalledTimes(1);
  });

  it('does not mark another user\'s notification (repo handles WHERE user_id=)', async () => {
    mockMarkRead.mockResolvedValue(false);

    await notifService.markRead('notif-1', OTHER_USER_ID);

    expect(mockMarkRead).toHaveBeenCalledWith('notif-1', OTHER_USER_ID);
  });
});

describe('Notification service — markAllRead', () => {
  it('calls repo markAllRead scoped to current user only', async () => {
    mockMarkAllRead.mockResolvedValue(3);

    await notifService.markAllRead(USER_ID);

    expect(mockMarkAllRead).toHaveBeenCalledWith(USER_ID);
    expect(mockMarkAllRead).not.toHaveBeenCalledWith(OTHER_USER_ID);
  });
});
