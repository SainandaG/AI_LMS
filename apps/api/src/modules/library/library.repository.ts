import { prisma, Book, Borrow, BookStatus } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class LibraryRepository {
  async findBooks(schoolId: string | undefined, params: PaginationInput): Promise<{ books: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      ...(schoolId ? { schoolId } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { author: { contains: params.search, mode: 'insensitive' } },
              { category: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          copies: true,
        },
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total };
  }

  async findBookById(id: string): Promise<any | null> {
    return prisma.book.findUnique({
      where: { id },
      include: {
        copies: {
          include: {
            borrows: {
              where: { returnedAt: null },
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async createBook(data: {
    schoolId?: string;
    title: string;
    author: string;
    category: string;
    isbn?: string;
    publisher?: string;
    description?: string;
    totalCopies?: number;
  }): Promise<Book> {
    let targetSchoolId = data.schoolId;
    if (!targetSchoolId) {
      const defaultSchool = await prisma.school.findFirst();
      if (defaultSchool) targetSchoolId = defaultSchool.id;
    }

    return prisma.book.create({
      data: {
        schoolId: targetSchoolId!,
        title: data.title,
        author: data.author,
        category: data.category,
        totalCopies: data.totalCopies ?? 1,
        ...(data.isbn ? { isbn: data.isbn } : {}),
        ...(data.publisher ? { publisher: data.publisher } : {}),
        ...(data.description ? { description: data.description } : {}),
      },
    });
  }

  async borrowBook(data: {
    bookCopyId: string;
    studentId: string;
    dueDate: Date;
  }): Promise<Borrow> {
    return prisma.$transaction(async (tx) => {
      await tx.bookCopy.update({
        where: { id: data.bookCopyId },
        data: { status: BookStatus.BORROWED },
      });

      return tx.borrow.create({
        data: {
          bookCopyId: data.bookCopyId,
          studentId: data.studentId,
          dueDate: data.dueDate,
        },
      });
    });
  }
}

export const libraryRepository = new LibraryRepository();
