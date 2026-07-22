import { Request, Response } from 'express';
import { PaginationSchema } from '@ai-lms/shared';
import { ContentType } from '@ai-lms/database';
import { z } from 'zod';

import { courseService } from './course.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class CourseController {
  async getCourses(req: Request, res: Response): Promise<void> {
    const params = PaginationSchema.parse(req.query);
    const schoolId = req.user!.schoolId!;

    const { courses, meta } = await courseService.getCourses(schoolId, params);
    sendSuccess(res, courses, 'Courses retrieved', 200, meta);
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const course = await courseService.getCourseById(id!);
    sendSuccess(res, course, 'Course details retrieved');
  }

  async createCourse(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      subjectId: z.string().uuid().optional(),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user!.schoolId!;
    const createdBy = req.user!.sub;

    const course = await courseService.createCourse({
      title: body.title,
      schoolId,
      createdBy,
      ...(body.description ? { description: body.description } : {}),
      ...(body.subjectId ? { subjectId: body.subjectId } : {}),
    });

    sendCreated(res, course, 'Course created successfully');
  }

  async createLesson(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      courseId: z.string().uuid(),
      title: z.string().min(2),
      description: z.string().optional(),
      content: z.string().optional(),
      contentType: z.nativeEnum(ContentType).optional(),
      order: z.number().int().min(1),
    });

    const body = schema.parse(req.body);
    const teacherId = req.user!.sub;

    const lesson = await courseService.createLesson({
      courseId: body.courseId,
      teacherId,
      title: body.title,
      order: body.order,
      ...(body.description ? { description: body.description } : {}),
      ...(body.content ? { content: body.content } : {}),
      ...(body.contentType ? { contentType: body.contentType } : {}),
    });

    sendCreated(res, lesson, 'Lesson added to course');
  }

  async createAssignment(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      courseId: z.string().uuid(),
      title: z.string().min(2),
      description: z.string().min(5),
      dueDate: z.string(),
      totalMarks: z.number().int().optional(),
    });

    const body = schema.parse(req.body);
    const teacherId = req.user!.sub;

    const assignment = await courseService.createAssignment({
      courseId: body.courseId,
      teacherId,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      ...(body.totalMarks ? { totalMarks: body.totalMarks } : {}),
    });

    sendCreated(res, assignment, 'Assignment created');
  }

  async submitAssignment(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      assignmentId: z.string().uuid(),
      content: z.string().min(1),
    });

    const body = schema.parse(req.body);
    const studentId = req.user!.sub;

    const submission = await courseService.submitAssignment({
      assignmentId: body.assignmentId,
      studentId,
      content: body.content,
    });

    sendSuccess(res, submission, 'Assignment submitted successfully');
  }

  // ─── AI Endpoints ──────────────────────────────────────────────────────────

  async generateAiLessonPlan(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      topic: z.string().min(2),
      grade: z.string().default('Grade 11'),
      duration: z.string().default('45 minutes'),
    });

    const { topic, grade, duration } = schema.parse(req.body);
    const plan = await courseService.generateAiLessonPlan(topic, grade, duration);
    sendSuccess(res, { plan }, 'AI lesson plan generated');
  }

  async generateAiAssignmentQuestions(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      topic: z.string().min(2),
      numQuestions: z.number().int().min(1).max(20).default(5),
    });

    const { topic, numQuestions } = schema.parse(req.body);
    const questions = await courseService.generateAiAssignmentQuestions(topic, numQuestions);
    sendSuccess(res, { questions }, 'AI assignment questions generated');
  }
}

export const courseController = new CourseController();
