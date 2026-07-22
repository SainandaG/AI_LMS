import { Router, Request, Response, IRouter } from 'express';
import { prisma } from '@ai-lms/database';
import { redis } from '@/infrastructure/redis/redis.client';

export const healthRouter: IRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = 'healthy';
  } catch {
    checks.services.database = 'unhealthy';
    checks.status = 'degraded';
  }

  try {
    await redis.ping();
    checks.services.redis = 'healthy';
  } catch {
    checks.services.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
});
