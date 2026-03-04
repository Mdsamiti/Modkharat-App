import { env } from '../config/env.js';
import pino from 'pino';

const logger = pino({ name: 'speech' });

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  languageCode: string;
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text.
 * Supports Arabic (ar-SA) and English (en-US).
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  languageCode: string = 'ar-SA',
): Promise<TranscriptionResult> {
  if (!env.GOOGLE_CLOUD_PROJECT) {
    throw new Error('Google Cloud Speech is not configured (GOOGLE_CLOUD_PROJECT missing)');
  }

  const { SpeechClient } = await import('@google-cloud/speech');

  const credentials = env.GOOGLE_CLOUD_KEY_JSON
    ? JSON.parse(Buffer.from(env.GOOGLE_CLOUD_KEY_JSON, 'base64').toString())
    : undefined;

  const client = new SpeechClient({
    projectId: env.GOOGLE_CLOUD_PROJECT,
    credentials,
  });

  try {
    const [response] = await client.recognize({
      audio: { content: audioBuffer.toString('base64') },
      config: {
        encoding: 'WEBM_OPUS' as any,
        sampleRateHertz: 48000,
        languageCode,
        alternativeLanguageCodes: languageCode === 'ar-SA' ? ['en-US'] : ['ar-SA'],
        enableAutomaticPunctuation: true,
      },
    });

    const results = response.results;
    if (!results || results.length === 0) {
      return { transcript: '', confidence: 0, languageCode };
    }

    const best = results[0].alternatives?.[0];
    return {
      transcript: best?.transcript ?? '',
      confidence: Math.round((best?.confidence ?? 0) * 100),
      languageCode: results[0].languageCode ?? languageCode,
    };
  } catch (err: any) {
    logger.error({ err }, 'Google Speech-to-Text failed');

    if (err.code === 8) throw new Error('Google Speech quota exceeded');
    if (err.code === 11) throw new Error('Audio format not supported');
    if (err.code === 4) throw new Error('Transcription timed out');

    throw new Error(`Transcription failed: ${err.message}`);
  }
}
