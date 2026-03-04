import { env } from '../config/env.js';
import pino from 'pino';

const logger = pino({ name: 'ocr' });

export interface OcrResult {
  fullText: string;
  confidence: number;
}

/**
 * Recognize text from a receipt image using Google Cloud Vision API.
 */
export async function recognizeReceipt(imageBuffer: Buffer): Promise<OcrResult> {
  if (!env.GOOGLE_CLOUD_PROJECT) {
    throw new Error('Google Cloud Vision is not configured (GOOGLE_CLOUD_PROJECT missing)');
  }

  const { ImageAnnotatorClient } = await import('@google-cloud/vision');

  const credentials = env.GOOGLE_CLOUD_KEY_JSON
    ? JSON.parse(Buffer.from(env.GOOGLE_CLOUD_KEY_JSON, 'base64').toString())
    : undefined;

  const client = new ImageAnnotatorClient({
    projectId: env.GOOGLE_CLOUD_PROJECT,
    credentials,
  });

  try {
    const [result] = await client.textDetection({ image: { content: imageBuffer } });
    const annotations = result.textAnnotations;

    if (!annotations || annotations.length === 0) {
      return { fullText: '', confidence: 0 };
    }

    const fullText = annotations[0].description ?? '';
    // Vision API doesn't return a direct confidence for text detection,
    // estimate from the number of detected text blocks
    const confidence = Math.min(95, 50 + annotations.length * 2);

    return { fullText, confidence };
  } catch (err: any) {
    logger.error({ err }, 'Google Vision OCR failed');

    if (err.code === 8) throw new Error('Google Vision quota exceeded');
    if (err.code === 3) throw new Error('Invalid image format');

    throw new Error(`OCR failed: ${err.message}`);
  }
}
