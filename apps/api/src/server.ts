import { createApp } from './app';
import { env } from '@/config/env';
import { logger } from '@/shared/utils/logger';
import { prisma } from '@ai-lms/database';
import { redis } from '@/infrastructure/redis/redis.client';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `🚀 AI-LMS API running on http://localhost:${env.PORT}`,
  );
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, '❌ Error during graceful shutdown');
      process.exit(1);
    }
  });

  // Force shutdown after 30s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

export default server;
