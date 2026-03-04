import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

// ---- Mock DB ----
const mockQuery = vi.fn();
vi.mock('../lib/db.js', () => ({
  pool: { query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }) },
  query: (...args: any[]) => mockQuery(...args),
}));

// ---- Mock Supabase ----
const mockGetUser = vi.fn();
vi.mock('../lib/supabase.js', () => ({
  supabaseAdmin: {
    auth: { getUser: (...args: any[]) => mockGetUser(...args) },
  },
}));

vi.mock('../config/env.js', () => ({
  env: {
    PORT: 3000,
    DATABASE_URL: 'postgresql://localhost/test',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    SUPABASE_JWT_SECRET: 'test-secret',
    CORS_ORIGIN: '*',
    NODE_ENV: 'test',
  },
}));

let app: any;

beforeAll(async () => {
  const mod = await import('../app.js');
  app = mod.default;
});

const USER_A = 'user-notif-a';
const USER_B = 'user-notif-b';

function mockAuthAs(userId: string) {
  mockGetUser.mockResolvedValue({
    data: { user: { id: userId, email: `${userId}@test.com` } },
    error: null,
  });
}

function makeNotifRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'notif-1',
    user_id: overrides.user_id ?? USER_A,
    household_id: overrides.household_id ?? 'hh-1',
    type: overrides.type ?? 'budget',
    title: overrides.title ?? 'Budget alert',
    message: overrides.message ?? 'Shopping budget exceeded',
    metadata: overrides.metadata ?? {},
    read_at: overrides.read_at ?? null,
    created_at: overrides.created_at ?? new Date(),
  };
}

describe('Notification routes — mark-read user scoping', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockQuery.mockReset();
    vi.clearAllMocks();
  });

  it('GET /v1/notifications returns only the authenticated user\'s notifications', async () => {
    mockAuthAs(USER_A);

    let callIdx = 0;
    mockQuery.mockImplementation((_sql: string, params?: any[]) => {
      callIdx++;
      // 1st call: context middleware (notifications route doesn't require household)
      // Notifications route doesn't use requireHousehold, so context may still run
      // but the route handler uses req.userId directly
      if (callIdx === 1) {
        // Context query — return no household (notifications don't need one)
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      // 2nd call: findNotificationsByUser — should be scoped to USER_A
      return Promise.resolve({
        rows: [
          makeNotifRow({ id: 'n1', user_id: USER_A }),
          makeNotifRow({ id: 'n2', user_id: USER_A, type: 'goal', title: 'Goal progress' }),
        ],
        rowCount: 2,
      });
    });

    const res = await request(app)
      .get('/v1/notifications')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    // Verify the DB query was called with USER_A
    const findCall = mockQuery.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('notifications') && call[0].includes('user_id'),
    );
    expect(findCall).toBeTruthy();
    expect(findCall![1]).toContain(USER_A);
  });

  it('PATCH /v1/notifications/:id/read scopes update to authenticated user', async () => {
    mockAuthAs(USER_A);

    let callIdx = 0;
    mockQuery.mockImplementation((_sql: string, params?: any[]) => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve({ rows: [], rowCount: 0 }); // context
      // markRead — should receive (id, USER_A)
      return Promise.resolve({ rows: [], rowCount: 1 });
    });

    const res = await request(app)
      .patch('/v1/notifications/notif-123/read')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);

    // Verify the update query includes both the notification ID and user ID
    const updateCall = mockQuery.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE') && call[0].includes('read_at'),
    );
    expect(updateCall).toBeTruthy();
    expect(updateCall![1]).toContain('notif-123');
    expect(updateCall![1]).toContain(USER_A);
  });

  it('PATCH /v1/notifications/:id/read cannot mark another user\'s notification', async () => {
    mockAuthAs(USER_B);

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve({ rows: [], rowCount: 0 }); // context
      // markRead — notification belongs to USER_A, but query is scoped to USER_B
      // rowCount = 0 means no rows matched (USER_B doesn't own this notification)
      return Promise.resolve({ rows: [], rowCount: 0 });
    });

    const res = await request(app)
      .patch('/v1/notifications/notif-owned-by-a/read')
      .set('Authorization', 'Bearer valid-token');

    // The endpoint still returns 200 (no error), but the update affected 0 rows
    expect(res.status).toBe(200);

    // Verify the query was scoped to USER_B (not USER_A)
    const updateCall = mockQuery.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE') && call[0].includes('read_at'),
    );
    expect(updateCall![1]).toContain(USER_B);
    expect(updateCall![1]).not.toContain(USER_A);
  });

  it('PATCH /v1/notifications/read-all scopes bulk update to authenticated user only', async () => {
    mockAuthAs(USER_A);

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve({ rows: [], rowCount: 0 }); // context
      // markAllRead — should only update USER_A's notifications
      return Promise.resolve({ rows: [], rowCount: 5 });
    });

    const res = await request(app)
      .patch('/v1/notifications/read-all')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);

    // Verify the bulk update query is scoped to USER_A
    // markAllRead SQL: "UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL"
    // markRead SQL: "UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL"
    // We want the markAllRead call (has user_id = $1, does NOT have "id = $1 AND")
    const updateCall = mockQuery.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE') && call[0].includes('user_id = $1') && !call[0].includes('id = $1 AND user_id'),
    );
    expect(updateCall).toBeTruthy();
    expect(updateCall![1]).toContain(USER_A);
  });

  it('notifications are not returned for unauthenticated requests', async () => {
    const res = await request(app).get('/v1/notifications');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('notification DTO includes correct icon/color from type mapping', async () => {
    mockAuthAs(USER_A);

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve({ rows: [], rowCount: 0 });
      return Promise.resolve({
        rows: [
          makeNotifRow({ id: 'n-budget', type: 'budget' }),
          makeNotifRow({ id: 'n-goal', type: 'goal' }),
          makeNotifRow({ id: 'n-unusual', type: 'unusual' }),
        ],
        rowCount: 3,
      });
    });

    const res = await request(app)
      .get('/v1/notifications')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    const [budget, goal, unusual] = res.body.data;

    expect(budget.icon).toBe('alert-circle');
    expect(budget.iconColor).toBe('#f59e0b');

    expect(goal.icon).toBe('target');
    expect(goal.iconColor).toBe('#10b981');

    expect(unusual.icon).toBe('trending-up');
    expect(unusual.iconColor).toBe('#ef4444');
  });
});
