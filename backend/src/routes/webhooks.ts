import { Router, Request, Response, NextFunction } from 'express';
import { validateTwilioSignature } from '../lib/twilio.js';
import * as twilioService from '../services/twilio.js';

const router = Router();

// POST /v1/webhooks/twilio/status — Twilio delivery status callback
router.post(
  '/twilio/status',
  validateTwilioSignature,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await twilioService.handleStatusWebhook({
        MessageSid: req.body.MessageSid,
        MessageStatus: req.body.MessageStatus,
        To: req.body.To,
        ErrorCode: req.body.ErrorCode,
      });

      // Twilio expects a 200 response
      res.status(200).send('<Response></Response>');
    } catch (err) { next(err); }
  },
);

export default router;
