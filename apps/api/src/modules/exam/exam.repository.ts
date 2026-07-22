import { prisma, Exam, Result, ExamType } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class ExamRepository {
  async findExams(schoolId: string | undefined, params: PaginationInput): Promise<{ exams: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      ...(schoolId ? { term: { academicYear: { schoolId } } } : {}),
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
    termId?: string;
    subjectId?: string;
    classId?: string;
    title: string;
    type: ExamType;
    totalMarks: number;
    passingMarks: number;
    scheduledAt: Date;
    duration: number;
    questions?: Array<{
      question: string;
      options?: string[] | undefined;
      correctAnswer?: string | undefined;
      marks?: number | undefined;
    }> | undefined;
  }): Promise<Exam> {
    let termId = data.termId;
    let subjectId = data.subjectId;
    let classId = data.classId;

    // Fallback lookups if IDs not explicitly provided
    if (!termId) {
      const term = await prisma.term.findFirst();
      if (term) termId = term.id;
    }
    if (!subjectId) {
      const subject = await prisma.subject.findFirst();
      if (subject) subjectId = subject.id;
    }
    if (!classId) {
      const cls = await prisma.class.findFirst();
      if (cls) classId = cls.id;
    }

    const exam = await prisma.exam.create({
      data: {
        termId: termId!,
        subjectId: subjectId!,
        classId: classId!,
        title: data.title,
        type: data.type,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        isPublished: true,
      },
    });

    // Create questions if passed
    if (data.questions && data.questions.length > 0) {
      await prisma.question.createMany({
        data: data.questions.map((q, idx) => ({
          examId: exam.id,
          type: 'MULTIPLE_CHOICE',
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || null,
          marks: q.marks || 10,
          order: idx + 1,
        })),
      });
    }

    return exam;
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
