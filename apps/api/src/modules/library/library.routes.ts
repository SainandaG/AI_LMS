import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { libraryController } from './library.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const libraryRouter: IRouter = Router();

libraryRouter.use(authenticate);

libraryRouter.get('/', (req, res) => libraryController.getBooks(req, res));
libraryRouter.get('/:id', (req, res) => libraryController.getBookById(req, res));

libraryRouter.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.LIBRARIAN),
  (req, res) => libraryController.createBook(req, res),
);

libraryRouter.post(
  '/borrow',
  requireRole(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN),
  (req, res) => libraryController.borrowBook(req, res),
);

libraryRouter.post('/ai/recommendations', (req, res) =>
  libraryController.recommendBooksWithAi(req, res),
);
