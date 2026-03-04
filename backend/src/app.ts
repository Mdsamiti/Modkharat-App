import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { env } from './config/env.js';
import { authMiddleware } from './middleware/auth.js';
import { contextMiddleware } from './middleware/context.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { idempotency } from './middleware/idempotency.js';
import { pool } from './lib/db.js';
import routes from './routes/index.js';
import webhookRoutes from './routes/webhooks.js';

const app = express();

// --- Global middleware ---
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(pinoHttp({ quietReqLogger: true }));

// Attach trace ID to every request
app.use((req, _res, next) => {
  req.traceId = crypto.randomUUID();
  next();
});

// --- Health checks (no auth required) ---
app.get('/health/live', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// --- Webhook routes (no JWT auth, uses provider signature validation) ---
app.use('/v1/webhooks', express.urlencoded({ extended: false }), webhookRoutes);

// --- Auth + context for all /v1 routes ---
app.use('/v1', apiLimiter, authMiddleware, idempotency, contextMiddleware, routes);

// --- Error handler ---
app.use(errorHandler);

export default app;
