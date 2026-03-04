import { env } from '../config/env.js';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino({ name: 'twilio' });

function getClient() {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing)');
  }
  // Dynamic import to avoid loading twilio when not configured
  return import('twilio').then((mod) => mod.default(env.TWILIO_ACCOUNT_SID!, env.TWILIO_AUTH_TOKEN!));
}

/**
 * Send an SMS message via Twilio.
 */
export async function sendSms(to: string, body: string): Promise<string> {
  if (!env.TWILIO_FROM_NUMBER) {
    throw new Error('Twilio FROM number not configured');
  }

  const client = await getClient();
  try {
    const message = await client.messages.create({
      to,
      from: env.TWILIO_FROM_NUMBER!,
      body,
    });
    logger.info({ sid: message.sid, to }, 'SMS sent');
    return message.sid;
  } catch (err: any) {
    logger.error({ err, to }, 'Failed to send SMS');
    throw new Error(`SMS send failed: ${err.message}`);
  }
}

/**
 * Middleware to validate Twilio webhook request signatures.
 * Protects against replay attacks and forged requests.
 */
export async function validateTwilioSignature(req: Request, res: Response, next: NextFunction) {
  if (!env.TWILIO_AUTH_TOKEN) {
    res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Twilio not configured', traceId: '' } });
    return;
  }

  try {
    const twilio = await import('twilio');
    const signature = req.headers['x-twilio-signature'] as string;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const isValid = twilio.validateRequest(
      env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      req.body,
    );

    if (!isValid) {
      logger.warn({ url }, 'Invalid Twilio signature');
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Invalid signature', traceId: '' } });
      return;
    }

    next();
  } catch (err: any) {
    logger.error({ err }, 'Twilio signature validation error');
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Signature validation failed', traceId: '' } });
  }
}
