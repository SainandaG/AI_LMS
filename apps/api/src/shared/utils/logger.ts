import pino from 'pino';
import { env } from '@/config/env';

const isDev = env.NODE_ENV === 'development';

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    base: {
      env: env.NODE_ENV,
      version: '1.0.0',
    },
    redact: {
      paths: ['*.password', '*.passwordHash', '*.token', '*.secret', '*.apiKey'],
      censor: '[REDACTED]',
    },
  },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      })
    : pino.destination(1), // stdout
);
