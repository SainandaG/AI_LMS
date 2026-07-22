import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/shared/utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 1000, 3000);
  },
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error({ err }, '❌ Redis error'));
redis.on('close', () => logger.warn('Redis connection closed'));

// Helper methods for type-safe Redis operations
export const redisHelpers = {
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await redis.setex(key, seconds, value);
  },

  async get(key: string): Promise<string | null> {
    return redis.get(key);
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await redis.del(...keys);
  },

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
  },

  async setJson<T>(key: string, value: T, seconds?: number): Promise<void> {
    const str = JSON.stringify(value);
    if (seconds) {
      await redis.setex(key, seconds, str);
    } else {
      await redis.set(key, str);
    }
  },

  async getJson<T>(key: string): Promise<T | null> {
    const str = await redis.get(key);
    if (!str) return null;
    return JSON.parse(str) as T;
  },

  async incr(key: string): Promise<number> {
    return redis.incr(key);
  },

  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  },
};
