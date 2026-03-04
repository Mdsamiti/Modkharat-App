import { Request, Response, NextFunction } from 'express';

/**
 * In-memory idempotency cache.
 * Stores the response for a given (userId + idempotency-key) so that
 * retried POST requests return the same result without side-effects.
 *
 * Entries expire after TTL_MS (10 minutes).
 */

interface CachedResponse {
  status: number;
  body: any;
  expiresAt: number;
}

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CachedResponse>();

// Periodic cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}, 5 * 60 * 1000).unref();

/**
 * Idempotency middleware.
 * Requires the client to send an `Idempotency-Key` header on POST requests.
 * If the key was seen before (within TTL), the cached response is returned.
 * If not, the response is captured and cached.
 */
export function idempotency(req: Request, res: Response, next: NextFunction) {
  // Only apply to POST (create) requests
  if (req.method !== 'POST') {
    next();
    return;
  }

  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
  if (!idempotencyKey) {
    // No key provided — proceed normally (idempotency is opt-in)
    next();
    return;
  }

  const cacheKey = `${req.userId ?? 'anon'}:${idempotencyKey}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    res.status(cached.status).json(cached.body);
    return;
  }

  // Intercept res.json to capture the response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    cache.set(cacheKey, {
      status: res.statusCode,
      body,
      expiresAt: Date.now() + TTL_MS,
    });
    return originalJson(body);
  };

  next();
}
