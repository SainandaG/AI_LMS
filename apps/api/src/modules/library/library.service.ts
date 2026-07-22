import { Book, Borrow } from '@ai-lms/database';
import { PaginationInput, PaginationMeta } from '@ai-lms/shared';
import { libraryRepository } from './library.repository';
import { aiHelpers } from '@/infrastructure/ai/openai.client';
import { NotFoundError } from '@/shared/errors/app-errors';
import { buildPaginationMeta } from '@/shared/utils/response.util';

export class LibraryService {
  async getBooks(
    schoolId: string,
    params: PaginationInput,
  ): Promise<{ books: any[]; meta: PaginationMeta }> {
    const { books, total } = await libraryRepository.findBooks(schoolId, params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { books, meta };
  }

  async getBookById(id: string): Promise<any> {
    const book = await libraryRepository.findBookById(id);
    if (!book) throw new NotFoundError('Book not found in library');
    return book;
  }

  async createBook(data: {
    schoolId: string;
    title: string;
    author: string;
    category: string;
    isbn?: string;
    publisher?: string;
    description?: string;
    totalCopies?: number;
  }): Promise<Book> {
    return libraryRepository.createBook(data);
  }

  async borrowBook(data: {
    bookCopyId: string;
    studentId: string;
    dueDate: string;
  }): Promise<Borrow> {
    return libraryRepository.borrowBook({
      bookCopyId: data.bookCopyId,
      studentId: data.studentId,
      dueDate: new Date(data.dueDate),
    });
  }

  async recommendBooksWithAi(studentInterests: string): Promise<string> {
    const prompt = `Recommend 4 essential academic & technical books for a student interested in "${studentInterests}". For each book, include Title, Author, and a brief 2-sentence rationale on why it's valuable.`;
    const system = 'You are an AI Academic Librarian giving curated reading recommendations to students.';
    return aiHelpers.generateCompletion(prompt, system);
  }
}

export const libraryService = new LibraryService();
