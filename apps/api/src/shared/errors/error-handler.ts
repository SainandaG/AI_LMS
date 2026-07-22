import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@ai-lms/database';
import { HTTP_STATUS } from '@ai-lms/shared';

import { AppError, ValidationError } from './app-errors';
import { logger } from '@/shared/utils/logger';
import { env } from '@/config/env';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ─── Zod Validation Error ─────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join('.') || 'root';
      if (!errors[key]) errors[key] = [];
      errors[key]!.push(e.message);
    });
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // ─── Custom App Error ─────────────────────────────────────────────────────
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
      return;
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // ─── Prisma Errors ────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.['target'] as string[])?.join(', ') ?? 'field';
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: `A record with this ${field} already exists`,
        code: 'DUPLICATE_ENTRY',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // ─── Unknown Error ────────────────────────────────────────────────────────
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
