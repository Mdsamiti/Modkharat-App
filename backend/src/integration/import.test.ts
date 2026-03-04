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
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      }),
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

// Mock import service to avoid real provider calls
const mockSubmitSms = vi.fn();
const mockSubmitOcr = vi.fn();
const mockSubmitVoice = vi.fn();
const mockGetJobStatus = vi.fn();
vi.mock('../services/import.js', () => ({
  submitSmsJob: (...args: any[]) => mockSubmitSms(...args),
  submitOcrJob: (...args: any[]) => mockSubmitOcr(...args),
  submitVoiceJob: (...args: any[]) => mockSubmitVoice(...args),
  getJobStatus: (...args: any[]) => mockGetJobStatus(...args),
  setBoss: vi.fn(),
}));

let app: any;

beforeAll(async () => {
  const mod = await import('../app.js');
  app = mod.default;
});

function mockAuthenticatedWithHousehold() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-imp-1', email: 'test@test.com' } },
    error: null,
  });
  mockQuery.mockResolvedValue({
    rows: [{
      household_id: 'hh-imp-1',
      role: 'member',
      view_only: false,
      can_add_transactions: true,
      can_edit_budgets: false,
      can_manage_members: false,
    }],
    rowCount: 1,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Import Routes — POST /v1/import/sms', () => {
  it('submits SMS and returns job + transaction', async () => {
    mockAuthenticatedWithHousehold();
    mockSubmitSms.mockResolvedValue({
      job: { id: 'job-1', type: 'sms', status: 'completed' },
      transaction: { id: 'tx-1', amount: 245.50, merchant: 'Carrefour' },
    });

    const res = await request(app)
      .post('/v1/import/sms')
      .set('Authorization', 'Bearer valid-token')
      .send({ rawText: 'Purchase of SAR 245.50 at Carrefour on 04/03/2026' });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('job-1');
    expect(res.body.transaction).toBeDefined();
  });

  it('rejects empty rawText', async () => {
    mockAuthenticatedWithHousehold();

    const res = await request(app)
      .post('/v1/import/sms')
      .set('Authorization', 'Bearer valid-token')
      .send({ rawText: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects without auth', async () => {
    const res = await request(app)
      .post('/v1/import/sms')
      .send({ rawText: 'some text' });

    expect(res.status).toBe(401);
  });

  it('rejects view-only members', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-imp-2', email: 'viewer@test.com' } },
      error: null,
    });
    mockQuery.mockResolvedValue({
      rows: [{
        household_id: 'hh-imp-1',
        role: 'member',
        view_only: true,
        can_add_transactions: false,
        can_edit_budgets: false,
        can_manage_members: false,
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .post('/v1/import/sms')
      .set('Authorization', 'Bearer valid-token')
      .send({ rawText: 'Purchase of SAR 100 at Store' });

    expect(res.status).toBe(403);
  });
});

describe('Import Routes — GET /v1/import/jobs/:jobId', () => {
  it('returns job status for valid job ID', async () => {
    mockAuthenticatedWithHousehold();
    mockGetJobStatus.mockResolvedValue({
      id: 'job-3', type: 'ocr', status: 'processing',
      transactionId: null, confidence: null,
    });

    const res = await request(app)
      .get('/v1/import/jobs/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('job-3');
  });

  it('returns 404 for unknown job', async () => {
    mockAuthenticatedWithHousehold();
    mockGetJobStatus.mockResolvedValue(null);

    const res = await request(app)
      .get('/v1/import/jobs/00000000-0000-0000-0000-000000000002')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);
  });

  it('rejects invalid job ID format', async () => {
    mockAuthenticatedWithHousehold();

    const res = await request(app)
      .get('/v1/import/jobs/not-a-uuid')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
