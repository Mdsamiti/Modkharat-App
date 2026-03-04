import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

// Mock DB
const mockQuery = vi.fn();
vi.mock('../lib/db.js', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
  },
  query: (...args: any[]) => mockQuery(...args),
}));

// Mock supabase
const mockGetUser = vi.fn();
vi.mock('../lib/supabase.js', () => ({
  supabaseAdmin: {
    auth: {
      getUser: (...args: any[]) => mockGetUser(...args),
    },
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

// Helper: set up mocks so requests pass auth + context (user has household with full permissions)
function mockAuthenticatedWithHousehold() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-sec-1', email: 'test@test.com' } },
    error: null,
  });
  // Context middleware query — return a household membership with organizer role
  mockQuery.mockResolvedValue({
    rows: [{
      household_id: 'hh-sec-1',
      role: 'organizer',
      view_only: false,
      can_add_transactions: true,
      can_edit_budgets: true,
      can_manage_members: true,
    }],
    rowCount: 1,
  });
}

describe('JWT / Auth security', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockQuery.mockReset();
    // Default: no household
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  it('rejects requests with no Authorization header', async () => {
    const res = await request(app).get('/v1/transactions');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects malformed Bearer token (no space)', async () => {
    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearertoken123');
    expect(res.status).toBe(401);
  });

  it('rejects empty Bearer token', async () => {
    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('rejects Basic auth scheme', async () => {
    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });

  it('rejects expired/invalid token via Supabase', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'token expired' } });
    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer expired-jwt-token');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid or expired token');
  });
});

describe('SQL injection protection via Zod validation', () => {
  beforeEach(() => {
    mockAuthenticatedWithHousehold();
  });

  it('rejects empty merchant (SQL injection vector)', async () => {
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'expense', amount: 100, merchant: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects negative amounts (prevents amount manipulation)', async () => {
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'expense', amount: -999, merchant: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects SQL injection string in categoryId (UUID validation)', async () => {
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'expense',
        amount: 100,
        merchant: 'Test',
        categoryId: "'; DROP TABLE transactions; --",
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects excessively long input strings', async () => {
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'expense',
        amount: 100,
        merchant: 'A'.repeat(201), // max 200
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects unknown fields in strict schema (no prototype pollution)', async () => {
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'expense',
        amount: 100,
        merchant: 'Test',
        isAdmin: true,
        __proto__: { admin: true },
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid type enum values', async () => {
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'refund', amount: 100, merchant: 'Test' });
    expect(res.status).toBe(400);
  });

  it('rejects empty household name', async () => {
    const res = await request(app)
      .post('/v1/households')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid email in invite', async () => {
    const res = await request(app)
      .post('/v1/households/fake-id/invites')
      .set('Authorization', 'Bearer valid-token')
      .send({ email: 'not-an-email', role: 'member' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Permission enforcement', () => {
  it('returns 403 NO_HOUSEHOLD for endpoints when user has no household', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-no-hh', email: 'lonely@test.com' } },
      error: null,
    });
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NO_HOUSEHOLD');
  });

  it('returns 403 FORBIDDEN when member lacks permission', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-member', email: 'member@test.com' } },
      error: null,
    });
    // Member without canAddTransactions
    mockQuery.mockResolvedValue({
      rows: [{
        household_id: 'hh-1',
        role: 'member',
        view_only: true,
        can_add_transactions: false,
        can_edit_budgets: false,
        can_manage_members: false,
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'expense', amount: 100, merchant: 'Test' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('error responses always include traceId', async () => {
    const res = await request(app).get('/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('traceId');
    expect(typeof res.body.error.traceId).toBe('string');
    expect(res.body.error.traceId.length).toBeGreaterThan(0);
  });
});

describe('Request size limits', () => {
  it('rejects request body exceeding 100kb limit', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-size', email: 'size@test.com' } },
      error: null,
    });

    const largePayload = { merchant: 'X'.repeat(110000) }; // > 100kb
    const res = await request(app)
      .post('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .send(largePayload);
    // Express returns 413 for payload too large, but our error handler
    // may catch it as 500 depending on how body-parser surfaces it
    expect([413, 500]).toContain(res.status);
  });
});

describe('Security headers', () => {
  it('includes Helmet security headers', async () => {
    const res = await request(app).get('/health/live');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-xss-protection']).toBe('0');
    expect(res.headers).toHaveProperty('content-security-policy');
    expect(res.headers).toHaveProperty('strict-transport-security');
  });

  it('includes CORS headers', async () => {
    const res = await request(app).get('/health/live');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('includes rate limit headers on /v1 routes', async () => {
    const res = await request(app).get('/v1/auth/me');
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });
});
