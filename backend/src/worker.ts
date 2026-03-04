import 'dotenv/config';
import { env } from './config/env.js';
import { setBoss } from './services/import.js';
import { handleOcrJob } from './jobs/ocr-handler.js';
import { handleVoiceJob } from './jobs/voice-handler.js';
import pino from 'pino';

const logger = pino({ name: 'worker' });

async function main() {
  // Dynamic import for ESM-only pg-boss
  const PgBossModule = await (Function('return import("pg-boss")')() as Promise<any>);
  const PgBoss = PgBossModule.default ?? PgBossModule;

  const boss = new PgBoss({
    connectionString: env.DATABASE_URL,
    retryLimit: 3,
    retryDelay: 30, // seconds
    retryBackoff: true, // exponential backoff
    expireInHours: 1,
    archiveCompletedAfterSeconds: 3600,
    deleteAfterDays: 7,
  });

  boss.on('error', (err: any) => {
    logger.error({ err }, 'pg-boss error');
  });

  await boss.start();
  logger.info('pg-boss worker started');

  // Share boss instance with import service for enqueueing
  setBoss(boss);

  const concurrency = env.WORKER_CONCURRENCY;

  // Register job handlers
  await boss.work('import:ocr', { teamConcurrency: concurrency }, handleOcrJob);
  logger.info({ concurrency }, 'Registered import:ocr handler');

  await boss.work('import:voice', { teamConcurrency: concurrency }, handleVoiceJob);
  logger.info({ concurrency }, 'Registered import:voice handler');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down worker');
    await boss.stop({ graceful: true, timeout: 30000 });
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Worker failed to start');
  process.exit(1);
});
