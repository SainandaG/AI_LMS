import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development hot-reload (Next.js / ts-node watch)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

export const prisma = global.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
}

export * from '@prisma/client';
export default prisma;
