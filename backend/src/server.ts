import { env } from './config/env.js';
import app from './app.js';
import pino from 'pino';

const logger = pino({ name: 'server' });

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`Health: http://localhost:${env.PORT}/health/live`);
  logger.info(`API:    http://localhost:${env.PORT}/v1`);
});
