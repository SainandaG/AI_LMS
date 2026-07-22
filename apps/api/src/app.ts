import 'express-async-errors';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';

import { env } from '@/config/env';
import { logger } from '@/shared/utils/logger';
import { globalErrorHandler } from '@/shared/errors/error-handler';
import { notFoundHandler } from '@/shared/middleware/not-found.middleware';
import { rateLimiter } from '@/shared/middleware/rate-limiter.middleware';

// ─── Route Imports ─────────────────────────────────────────────────────────────
import { authRouter } from '@/modules/auth/auth.routes';
import { healthRouter } from '@/modules/health/health.routes';
import { schoolRouter } from '@/modules/school/school.routes';
import { studentRouter } from '@/modules/student/student.routes';
import { teacherRouter } from '@/modules/teacher/teacher.routes';
import { courseRouter } from '@/modules/course/course.routes';
import { aiRouter } from '@/modules/ai/ai.routes';
import { attendanceRouter } from '@/modules/attendance/attendance.routes';
import { examRouter } from '@/modules/exam/exam.routes';
import { accountsRouter } from '@/modules/accounts/accounts.routes';
import { libraryRouter } from '@/modules/library/library.routes';
import { placementRouter } from '@/modules/placement/placement.routes';
import { analyticsRouter } from '@/modules/analytics/analytics.routes';
import { notificationRouter } from '@/modules/notification/notification.routes';

export const createApp = (): Application => {
  const app = express();

  // ─── Security ──────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman), configured origins, or any Vercel deployment
        if (!origin || env.CORS_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    }),
  );

  // ─── Body Parsing & Compression ────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(compression());

  // ─── Request Logging ───────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        logger,
        customLogLevel: (_req, res) => {
          if (res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
      }),
    );
  }

  // ─── Global Rate Limiter ───────────────────────────────────────────────────
  app.use('/api', rateLimiter.global);

  // ─── Routes ────────────────────────────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({
      status: 'online',
      name: 'AI-LMS Backend API',
      version: '1.0.0',
      health: '/health',
      docs: '/api/v1',
    });
  });
  app.use('/health', healthRouter);
  app.use('/api/v1/auth', rateLimiter.auth, authRouter);
  app.use('/api/v1/schools', schoolRouter);
  app.use('/api/v1/students', studentRouter);
  app.use('/api/v1/teachers', teacherRouter);
  app.use('/api/v1/courses', courseRouter);
  app.use('/api/v1/ai', aiRouter);
  app.use('/api/v1/attendance', attendanceRouter);
  app.use('/api/v1/exams', examRouter);
  app.use('/api/v1/accounts', accountsRouter);
  app.use('/api/v1/library', libraryRouter);
  app.use('/api/v1/placement', placementRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/notifications', notificationRouter);

  // ─── Error Handling ────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
