import { Router, IRouter } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { rateLimiter } from '@/shared/middleware/rate-limiter.middleware';

export const aiRouter: IRouter = Router();

aiRouter.use(authenticate);
aiRouter.use(rateLimiter.ai);

aiRouter.post('/tutor', (req, res) => aiController.chatWithTutor(req, res));
aiRouter.post('/flashcards', (req, res) => aiController.generateFlashcards(req, res));
aiRouter.post('/notes', (req, res) => aiController.generateNotes(req, res));
aiRouter.post('/ingest', (req, res) => aiController.ingestMaterial(req, res));
