import { Request, Response } from 'express';
import { PaginationSchema } from '@ai-lms/shared';
import { z } from 'zod';

import { libraryService } from './library.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class LibraryController {
  async getBooks(req: Request, res: Response): Promise<void> {
    const params = PaginationSchema.parse(req.query);
    const schoolId = req.user?.schoolId ?? undefined;

    const { books, meta } = await libraryService.getBooks(schoolId, params);
    sendSuccess(res, books, 'Library books retrieved', 200, meta);
  }

  async getBookById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const book = await libraryService.getBookById(id!);
    sendSuccess(res, book, 'Book details retrieved');
  }

  async createBook(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      title: z.string().min(2),
      author: z.string().min(2),
      category: z.string().min(2),
      isbn: z.string().optional(),
      publisher: z.string().optional(),
      description: z.string().optional(),
      totalCopies: z.number().int().min(1).optional(),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user?.schoolId ?? undefined;

    const book = await libraryService.createBook({
      title: body.title,
      author: body.author,
      category: body.category,
      ...(schoolId ? { schoolId } : {}),
      ...(body.isbn ? { isbn: body.isbn } : {}),
      ...(body.publisher ? { publisher: body.publisher } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.totalCopies !== undefined ? { totalCopies: body.totalCopies } : {}),
    });

    sendCreated(res, book, 'Book added to library catalog');
  }

  async borrowBook(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      bookCopyId: z.string().uuid(),
      studentId: z.string().uuid(),
      dueDate: z.string(),
    });

    const body = schema.parse(req.body);
    const borrow = await libraryService.borrowBook(body);
    sendSuccess(res, borrow, 'Book borrowed successfully');
  }

  async recommendBooksWithAi(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      interests: z.string().min(2),
    });

    const { interests } = schema.parse(req.body);
    const recommendations = await libraryService.recommendBooksWithAi(interests);
    sendSuccess(res, { recommendations }, 'AI book recommendations generated');
  }
}

export const libraryController = new LibraryController();
