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

// Deterministic dataset: 5 transactions in a household
// - 2 income: 10000, 5000
// - 3 expense: Shopping 3000, Food 2000, Transport 1500
const SEED_INCOME_TOTAL = 15000;
const SEED_EXPENSE_TOTAL = 6500;
const SEED_SAVINGS_RATE = Math.round(((SEED_INCOME_TOTAL - SEED_EXPENSE_TOTAL) / SEED_INCOME_TOTAL) * 100); // 57

function mockAuth() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-a1', email: 'analytics@test.com' } },
    error: null,
  });
}

/** Sequences of query results the mock will return in order. */
function setupQuerySequence(results: any[]) {
  let callIdx = 0;
  mockQuery.mockImplementation(() => {
    const result = results[callIdx] ?? { rows: [], rowCount: 0 };
    callIdx++;
    return Promise.resolve(result);
  });
}

describe('Analytics endpoints — deterministic dataset verification', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockQuery.mockReset();
    vi.clearAllMocks();
  });

  it('GET /v1/analytics/overview returns income, expenses, and savingsRate matching transaction totals', async () => {
    mockAuth();
    setupQuerySequence([
      // 1st call: context middleware — household membership
      {
        rows: [{
          household_id: 'hh-a1',
          role: 'organizer',
          view_only: false,
          can_add_transactions: true,
          can_edit_budgets: true,
          can_manage_members: true,
        }],
        rowCount: 1,
      },
      // 2nd call: getIncomeVsExpenses (1 month)
      {
        rows: [{
          month: 'Mar',
          income: String(SEED_INCOME_TOTAL),
          expense: String(SEED_EXPENSE_TOTAL),
        }],
        rowCount: 1,
      },
    ]);

    const res = await request(app)
      .get('/v1/analytics/overview')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.income).toBe(SEED_INCOME_TOTAL);
    expect(res.body.data.expenses).toBe(SEED_EXPENSE_TOTAL);
    expect(res.body.data.savingsRate).toBe(SEED_SAVINGS_RATE);
  });

  it('GET /v1/analytics/overview returns zeros when no transactions exist', async () => {
    mockAuth();
    setupQuerySequence([
      // context
      {
        rows: [{ household_id: 'hh-a1', role: 'organizer', view_only: false, can_add_transactions: true, can_edit_budgets: true, can_manage_members: true }],
        rowCount: 1,
      },
      // empty month
      { rows: [], rowCount: 0 },
    ]);

    const res = await request(app)
      .get('/v1/analytics/overview')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ income: 0, expenses: 0, savingsRate: 0 });
  });

  it('GET /v1/analytics/spending-by-category returns per-category breakdown matching totals', async () => {
    mockAuth();
    setupQuerySequence([
      // context
      {
        rows: [{ household_id: 'hh-a1', role: 'organizer', view_only: false, can_add_transactions: true, can_edit_budgets: true, can_manage_members: true }],
        rowCount: 1,
      },
      // spending by category
      {
        rows: [
          { category_name_en: 'Shopping', category_name_ar: 'التسوق', color: '#8b5cf6', total: '3000' },
          { category_name_en: 'Food', category_name_ar: 'الطعام', color: '#f59e0b', total: '2000' },
          { category_name_en: 'Transport', category_name_ar: 'النقل', color: '#3b82f6', total: '1500' },
        ],
        rowCount: 3,
      },
    ]);

    const res = await request(app)
      .get('/v1/analytics/spending-by-category')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);

    // Verify each category matches the seeded amounts
    expect(res.body.data[0]).toEqual({ name: { en: 'Shopping', ar: 'التسوق' }, value: 3000, color: '#8b5cf6' });
    expect(res.body.data[1]).toEqual({ name: { en: 'Food', ar: 'الطعام' }, value: 2000, color: '#f59e0b' });
    expect(res.body.data[2]).toEqual({ name: { en: 'Transport', ar: 'النقل' }, value: 1500, color: '#3b82f6' });

    // Sum of categories should match SEED_EXPENSE_TOTAL
    const totalSpending = res.body.data.reduce((sum: number, c: any) => sum + c.value, 0);
    expect(totalSpending).toBe(SEED_EXPENSE_TOTAL);
  });

  it('GET /v1/analytics/income-vs-expenses returns monthly breakdown with correct parsing', async () => {
    mockAuth();
    setupQuerySequence([
      // context
      {
        rows: [{ household_id: 'hh-a1', role: 'organizer', view_only: false, can_add_transactions: true, can_edit_budgets: true, can_manage_members: true }],
        rowCount: 1,
      },
      // 3 months
      {
        rows: [
          { month: 'Jan', income: '12000', expense: '8000' },
          { month: 'Feb', income: '13500', expense: '7200' },
          { month: 'Mar', income: String(SEED_INCOME_TOTAL), expense: String(SEED_EXPENSE_TOTAL) },
        ],
        rowCount: 3,
      },
    ]);

    const res = await request(app)
      .get('/v1/analytics/income-vs-expenses?months=3')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);

    // Verify all amounts are numeric (not strings)
    for (const entry of res.body.data) {
      expect(typeof entry.income).toBe('number');
      expect(typeof entry.expense).toBe('number');
    }

    // Verify the last month matches seed data
    const latest = res.body.data[2];
    expect(latest.month).toBe('Mar');
    expect(latest.income).toBe(SEED_INCOME_TOTAL);
    expect(latest.expense).toBe(SEED_EXPENSE_TOTAL);
  });

  it('savings rate is consistent: (income - expense) / income * 100', async () => {
    mockAuth();
    // Edge case: income equals expenses -> 0% savings
    setupQuerySequence([
      {
        rows: [{ household_id: 'hh-a1', role: 'organizer', view_only: false, can_add_transactions: true, can_edit_budgets: true, can_manage_members: true }],
        rowCount: 1,
      },
      { rows: [{ month: 'Mar', income: '5000', expense: '5000' }], rowCount: 1 },
    ]);

    const res = await request(app)
      .get('/v1/analytics/overview')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.savingsRate).toBe(0);
  });

  it('response follows { data: ... } envelope shape', async () => {
    mockAuth();
    setupQuerySequence([
      {
        rows: [{ household_id: 'hh-a1', role: 'organizer', view_only: false, can_add_transactions: true, can_edit_budgets: true, can_manage_members: true }],
        rowCount: 1,
      },
      { rows: [{ month: 'Mar', income: '10000', expense: '6000' }], rowCount: 1 },
    ]);

    const res = await request(app)
      .get('/v1/analytics/overview')
      .set('Authorization', 'Bearer valid-token');

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('income');
    expect(res.body.data).toHaveProperty('expenses');
    expect(res.body.data).toHaveProperty('savingsRate');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/v1/analytics/overview');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
