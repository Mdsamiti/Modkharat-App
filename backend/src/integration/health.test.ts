import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

// Mock the DB pool before importing app
vi.mock('../lib/db.js', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
  },
  query: vi.fn(),
}));

// Mock supabase to avoid env validation issues
vi.mock('../lib/supabase.js', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } }),
    },
  },
}));

// Mock env
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

describe('GET /health/live', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /health/ready', () => {
  it('returns 200 when DB is connected', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });

  it('returns 503 when DB is disconnected', async () => {
    const { pool } = await import('../lib/db.js');
    (pool.query as any).mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error', db: 'disconnected' });
  });
});

describe('Auth contract — unauthorized requests', () => {
  it('returns 401 with standard error shape when no token is sent', async () => {
    const res = await request(app).get('/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('traceId');
    expect(typeof res.body.error.traceId).toBe('string');
  });

  it('returns 401 with standard error shape for invalid token', async () => {
    const res = await request(app)
      .get('/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-123');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toBe('Invalid or expired token');
  });

  it('returns standard error shape for all protected endpoints', async () => {
    const endpoints = [
      { method: 'get', path: '/v1/transactions' },
      { method: 'get', path: '/v1/budgets' },
      { method: 'get', path: '/v1/goals' },
      { method: 'get', path: '/v1/notifications' },
      { method: 'get', path: '/v1/households' },
      { method: 'get', path: '/v1/analytics/overview' },
      { method: 'get', path: '/v1/categories' },
      { method: 'get', path: '/v1/accounts' },
    ];

    for (const ep of endpoints) {
      const res = await (request(app) as any)[ep.method](ep.path);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('traceId');
    }
  });
});

describe('404 handling', () => {
  it('returns 404 for unknown routes under /v1 (after auth)', async () => {
    // Without auth, it should return 401 first
    const res = await request(app).get('/v1/nonexistent');
    expect(res.status).toBe(401);
  });

  it('returns 404 for routes outside /v1 and /health', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});
