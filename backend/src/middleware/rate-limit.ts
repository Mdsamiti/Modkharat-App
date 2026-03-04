import rateLimit from 'express-rate-limit';

/** General API rate limit: 100 requests per minute per IP */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later', traceId: '' } },
});

/** Stricter limit for auth-adjacent routes: 20 requests per minute per IP */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many auth requests, please try again later', traceId: '' } },
});

/** Stricter limit for import/ingestion routes: 10 requests per minute per IP */
export const importLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many import requests, please try again later', traceId: '' } },
});
