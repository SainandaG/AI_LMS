import { prisma, Exam, Result, ExamType } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class ExamRepository {
  async findExams(schoolId: string, params: PaginationInput): Promise<{ exams: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      term: { academicYear: { schoolId } },
      ...(params.search ? { title: { contains: params.search, mode: 'insensitive' } } : {}),
    };

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          questions: true,
          results: {
            include: {
              student: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.exam.count({ where }),
    ]);

    return { exams, total };
  }

  async findExamById(id: string): Promise<any | null> {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        results: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });
  }

  async createExam(data: {
    termId: string;
    subjectId: string;
    classId: string;
    title: string;
    type: ExamType;
    totalMarks: number;
    passingMarks: number;
    scheduledAt: Date;
    duration: number;
  }): Promise<Exam> {
    return prisma.exam.create({
      data: {
        termId: data.termId,
        subjectId: data.subjectId,
        classId: data.classId,
        title: data.title,
        type: data.type,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        isPublished: true,
      },
    });
  }

  async recordResult(data: {
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
  }): Promise<Result> {
    const exam = await prisma.exam.findUnique({ where: { id: data.examId } });
    const isPassed = exam ? data.marksObtained >= exam.passingMarks : true;
    const grade = data.marksObtained >= 90 ? 'A+' : data.marksObtained >= 75 ? 'A' : data.marksObtained >= 60 ? 'B' : 'C';

    return prisma.result.upsert({
      where: {
        examId_studentId: {
          examId: data.examId,
          studentId: data.studentId,
        },
      },
      update: {
        marksObtained: data.marksObtained,
        grade,
        isPassed,
        publishedAt: new Date(),
        ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
      },
      create: {
        examId: data.examId,
        studentId: data.studentId,
        marksObtained: data.marksObtained,
        grade,
        isPassed,
        publishedAt: new Date(),
        ...(data.remarks ? { remarks: data.remarks } : {}),
      },
    });
  }
}

export const examRepository = new ExamRepository();
