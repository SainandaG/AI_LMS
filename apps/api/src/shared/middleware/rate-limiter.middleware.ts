import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@ai-lms/shared';
import { TooManyRequestsError } from '@/shared/errors/app-errors';

const createLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError());
    },
    keyGenerator: (req) => req.ip ?? 'unknown',
  });

export const rateLimiter = {
  global: createLimiter(RATE_LIMITS.API.WINDOW_MS, RATE_LIMITS.API.MAX),
  auth: createLimiter(RATE_LIMITS.AUTH.WINDOW_MS, RATE_LIMITS.AUTH.MAX),
  otp: createLimiter(RATE_LIMITS.OTP.WINDOW_MS, RATE_LIMITS.OTP.MAX),
  ai: createLimiter(RATE_LIMITS.AI.WINDOW_MS, RATE_LIMITS.AI.MAX),
};
