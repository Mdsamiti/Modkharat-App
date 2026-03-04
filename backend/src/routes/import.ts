import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireHousehold, requirePermission } from '../middleware/context.js';
import { importLimiter } from '../middleware/rate-limit.js';
import * as importService from '../services/import.js';

const router = Router();

// Multer config: store files in memory (max 10MB for images, 25MB for audio)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Zod schemas
const smsSchema = z.object({
  rawText: z.string().min(1).max(2000),
  senderPhone: z.string().max(20).optional(),
});

const jobIdSchema = z.object({
  jobId: z.string().uuid(),
});

// POST /v1/import/ocr — Upload receipt image for OCR processing
router.post(
  '/ocr',
  importLimiter,
  requireHousehold,
  requirePermission('canAddTransactions'),
  upload.single('receipt'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Receipt image file is required', traceId: req.traceId ?? '' },
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid file type. Accepted: JPEG, PNG, WebP, HEIC', traceId: req.traceId ?? '' },
        });
        return;
      }

      const job = await importService.submitOcrJob(req.householdId!, req.userId!, req.file);
      res.status(202).json({ data: job });
    } catch (err) { next(err); }
  },
);

// POST /v1/import/voice — Upload audio for voice transcription
router.post(
  '/voice',
  importLimiter,
  requireHousehold,
  requirePermission('canAddTransactions'),
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Audio file is required', traceId: req.traceId ?? '' },
        });
        return;
      }

      const language = (req.body?.language as string) || 'ar-SA';
      const job = await importService.submitVoiceJob(req.householdId!, req.userId!, req.file, language);
      res.status(202).json({ data: job });
    } catch (err) { next(err); }
  },
);

// POST /v1/import/sms — Parse bank SMS text
router.post(
  '/sms',
  importLimiter,
  requireHousehold,
  requirePermission('canAddTransactions'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = smsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, traceId: req.traceId ?? '' },
        });
        return;
      }

      const result = await importService.submitSmsJob(
        req.householdId!,
        req.userId!,
        parsed.data.rawText,
        parsed.data.senderPhone,
      );

      res.json({ data: result.job, transaction: result.transaction });
    } catch (err) { next(err); }
  },
);

// GET /v1/import/jobs/:jobId — Poll job status
router.get(
  '/jobs/:jobId',
  requireHousehold,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = jobIdSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid job ID', traceId: req.traceId ?? '' },
        });
        return;
      }

      const job = await importService.getJobStatus(parsed.data.jobId, req.householdId!);
      if (!job) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Job not found', traceId: req.traceId ?? '' },
        });
        return;
      }

      res.json({ data: job });
    } catch (err) { next(err); }
  },
);

export default router;
