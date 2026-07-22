import { prisma, Course, Lesson, Assignment, Submission, ContentType } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class CourseRepository {
  async findCourses(schoolId: string | undefined, params: PaginationInput): Promise<{ courses: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      ...(schoolId ? { schoolId } : {}),
      ...(params.search ? { title: { contains: params.search, mode: 'insensitive' } } : {}),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          lessons: { select: { id: true, title: true, contentType: true, duration: true } },
          assignments: { select: { id: true, title: true, dueDate: true, totalMarks: true } },
          subject: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  async findCourseById(id: string): Promise<any | null> {
    return prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        assignments: {
          include: {
            submissions: {
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
        subject: true,
      },
    });
  }

  async createCourse(data: {
    schoolId?: string;
    title: string;
    description?: string;
    thumbnail?: string;
    subjectId?: string;
    createdBy: string;
  }): Promise<Course> {
    // If no schoolId provided, fallback to first available school in DB or omit filter
    let targetSchoolId = data.schoolId;
    if (!targetSchoolId) {
      const defaultSchool = await prisma.school.findFirst();
      if (defaultSchool) {
        targetSchoolId = defaultSchool.id;
      }
    }

    return prisma.course.create({
      data: {
        schoolId: targetSchoolId!,
        title: data.title,
        createdBy: data.createdBy,
        isPublished: true,
        ...(data.description ? { description: data.description } : {}),
        ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
        ...(data.subjectId ? { subjectId: data.subjectId } : {}),
      },
    });
  }

  async createLesson(data: {
    courseId: string;
    teacherId: string;
    title: string;
    description?: string;
    content?: string;
    contentType?: ContentType;
    order: number;
  }): Promise<Lesson> {
    return prisma.lesson.create({
      data: {
        courseId: data.courseId,
        teacherId: data.teacherId,
        title: data.title,
        order: data.order,
        isPublished: true,
        contentType: data.contentType ?? ContentType.TEXT,
        ...(data.description ? { description: data.description } : {}),
        ...(data.content ? { content: data.content } : {}),
      },
    });
  }

  async createAssignment(data: {
    courseId: string;
    teacherId: string;
    title: string;
    description: string;
    totalMarks?: number;
    dueDate: Date;
  }): Promise<Assignment> {
    return prisma.assignment.create({
      data: {
        courseId: data.courseId,
        teacherId: data.teacherId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        totalMarks: data.totalMarks ?? 100,
        isPublished: true,
      },
    });
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    content: string;
  }): Promise<Submission> {
    return prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      },
      update: {
        content: data.content,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        content: data.content,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }
}

export const courseRepository = new CourseRepository();
