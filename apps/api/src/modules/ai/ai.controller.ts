import { Request, Response } from 'express';
import { AiChatSchema } from '@ai-lms/shared';
import { z } from 'zod';

import { aiService } from './ai.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

import { AiMessage } from '@ai-lms/shared';

export class AiController {
  async chatWithTutor(req: Request, res: Response): Promise<void> {
    const { messages, courseId } = AiChatSchema.parse(req.body);
    const response = await aiService.chatWithTutor(messages as AiMessage[], courseId);
    sendSuccess(res, response, 'AI response generated');
  }

  async generateFlashcards(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      topic: z.string().min(2),
      count: z.number().int().min(1).max(20).default(5),
    });
    const { topic, count } = schema.parse(req.body);
    const flashcards = await aiService.generateFlashcards(topic, count);
    sendSuccess(res, flashcards, 'AI flashcards generated');
  }

  async generateNotes(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      topic: z.string().min(2),
    });
    const { topic } = schema.parse(req.body);
    const notes = await aiService.generateNotes(topic);
    sendSuccess(res, { notes }, 'AI revision notes generated');
  }

  async ingestMaterial(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      title: z.string().min(2),
      content: z.string().min(10),
      courseId: z.string().uuid().optional(),
    });
    const { title, content, courseId } = schema.parse(req.body);
    const doc = await aiService.ingestCourseMaterial(title, content, courseId);
    sendCreated(res, doc, 'Document ingested into vector store');
  }
}

export const aiController = new AiController();
