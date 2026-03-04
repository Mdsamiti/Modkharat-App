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

vi.mock('../lib/cache.js', () => ({
  cacheGet: vi.fn().mockReturnValue(undefined),
  cacheSet: vi.fn(),
}));

let app: any;

beforeAll(async () => {
  const mod = await import('../app.js');
  app = mod.default;
});

function mockAuth() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-perf-1', email: 'perf@test.com' } },
    error: null,
  });
}

function householdCtx() {
  return {
    rows: [{
      household_id: 'hh-perf-1',
      role: 'organizer',
      view_only: false,
      can_add_transactions: true,
      can_edit_budgets: true,
      can_manage_members: true,
    }],
    rowCount: 1,
  };
}

/** Generate N fake transaction rows */
function generateTransactionRows(count: number) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `tx-${i}`,
      household_id: 'hh-perf-1',
      category_id: `cat-${i % 5}`,
      account_id: 'acc-1',
      created_by: 'user-perf-1',
      type: i % 3 === 0 ? 'income' : 'expense',
      amount: String((Math.random() * 10000).toFixed(2)),
      merchant: `Merchant ${i}`,
      notes: null,
      method: 'manual',
      status: 'confirmed',
      has_receipt: false,
      occurred_at: new Date(2026, 2, 1 + (i % 28)),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      category_name_en: `Category ${i % 5}`,
    });
  }
  return rows;
}

describe('Performance — transaction list with realistic dataset volumes', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockQuery.mockReset();
    vi.clearAllMocks();
  });

  it('handles 100 transaction rows response within acceptable time', async () => {
    mockAuth();
    const rows = generateTransactionRows(100);

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve(householdCtx());
      if (callIdx === 2) return Promise.resolve({ rows, rowCount: 100 }); // data
      return Promise.resolve({ rows: [{ count: '100' }], rowCount: 1 }); // count
    });

    const start = Date.now();
    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer valid-token');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(500); // Should respond in under 500ms
  });

  it('rejects limit over 100 via Zod validation', async () => {
    mockAuth();

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve(householdCtx());
      return Promise.resolve({ rows: [], rowCount: 0 });
    });

    const res = await request(app)
      .get('/v1/transactions?limit=500')
      .set('Authorization', 'Bearer valid-token');

    // Zod schema has .max(100) — rejects values above 100
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('handles empty transaction list efficiently', async () => {
    mockAuth();

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve(householdCtx());
      if (callIdx === 2) return Promise.resolve({ rows: [], rowCount: 0 });
      return Promise.resolve({ rows: [{ count: '0' }], rowCount: 1 });
    });

    const start = Date.now();
    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer valid-token');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(200);
  });
});

describe('Performance — analytics endpoints', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockQuery.mockReset();
    vi.clearAllMocks();
  });

  it('overview endpoint responds within acceptable time', async () => {
    mockAuth();

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve(householdCtx());
      return Promise.resolve({
        rows: [{ month: 'Mar', income: '15000', expense: '9000' }],
        rowCount: 1,
      });
    });

    const start = Date.now();
    const res = await request(app)
      .get('/v1/analytics/overview')
      .set('Authorization', 'Bearer valid-token');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(300);
  });

  it('spending-by-category handles 20 categories within acceptable time', async () => {
    mockAuth();

    const categories = Array.from({ length: 20 }, (_, i) => ({
      category_name_en: `Category ${i}`,
      category_name_ar: `فئة ${i}`,
      color: `#${String(i).padStart(6, '0')}`,
      total: String((Math.random() * 5000).toFixed(2)),
    }));

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve(householdCtx());
      return Promise.resolve({ rows: categories, rowCount: 20 });
    });

    const start = Date.now();
    const res = await request(app)
      .get('/v1/analytics/spending-by-category')
      .set('Authorization', 'Bearer valid-token');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(20);
    expect(elapsed).toBeLessThan(300);
  });

  it('income-vs-expenses handles 12 months within acceptable time', async () => {
    mockAuth();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const rows = months.map((m) => ({
      month: m,
      income: String(Math.round(Math.random() * 20000)),
      expense: String(Math.round(Math.random() * 15000)),
    }));

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      if (callIdx === 1) return Promise.resolve(householdCtx());
      return Promise.resolve({ rows, rowCount: 12 });
    });

    const start = Date.now();
    const res = await request(app)
      .get('/v1/analytics/income-vs-expenses?months=12')
      .set('Authorization', 'Bearer valid-token');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(12);
    expect(elapsed).toBeLessThan(300);
  });

  it('concurrent analytics requests all resolve correctly', async () => {
    mockAuth();

    let callIdx = 0;
    mockQuery.mockImplementation(() => {
      callIdx++;
      // Context queries (odd calls)
      if (callIdx % 2 === 1) return Promise.resolve(householdCtx());
      // Data queries (even calls)
      return Promise.resolve({
        rows: [{ month: 'Mar', income: '10000', expense: '7000' }],
        rowCount: 1,
      });
    });

    const [r1, r2, r3] = await Promise.all([
      request(app).get('/v1/analytics/overview').set('Authorization', 'Bearer valid-token'),
      request(app).get('/v1/analytics/overview').set('Authorization', 'Bearer valid-token'),
      request(app).get('/v1/analytics/overview').set('Authorization', 'Bearer valid-token'),
    ]);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(200);
  });
});
