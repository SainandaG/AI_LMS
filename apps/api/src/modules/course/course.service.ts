import { Course, Lesson, Assignment, Submission, ContentType } from '@ai-lms/database';
import { PaginationInput, PaginationMeta } from '@ai-lms/shared';
import { courseRepository } from './course.repository';
import { aiHelpers } from '@/infrastructure/ai/openai.client';
import { NotFoundError } from '@/shared/errors/app-errors';
import { buildPaginationMeta } from '@/shared/utils/response.util';
import { logger } from '@/shared/utils/logger';

export class CourseService {
  async getCourses(
    schoolId: string,
    params: PaginationInput,
  ): Promise<{ courses: any[]; meta: PaginationMeta }> {
    const { courses, total } = await courseRepository.findCourses(schoolId, params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { courses, meta };
  }

  async getCourseById(id: string): Promise<any> {
    const course = await courseRepository.findCourseById(id);
    if (!course) throw new NotFoundError('Course not found');
    return course;
  }

  async createCourse(data: {
    schoolId: string;
    title: string;
    description?: string;
    subjectId?: string;
    createdBy: string;
  }): Promise<Course> {
    const course = await courseRepository.createCourse(data);
    logger.info({ courseId: course.id, title: course.title }, 'Course created');
    return course;
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
    await this.getCourseById(data.courseId);
    return courseRepository.createLesson(data);
  }

  async createAssignment(data: {
    courseId: string;
    teacherId: string;
    title: string;
    description: string;
    totalMarks?: number;
    dueDate: string;
  }): Promise<Assignment> {
    await this.getCourseById(data.courseId);
    return courseRepository.createAssignment({
      ...data,
      dueDate: new Date(data.dueDate),
    });
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    content: string;
  }): Promise<Submission> {
    return courseRepository.submitAssignment(data);
  }

  // ─── AI Features ──────────────────────────────────────────────────────────

  async generateAiLessonPlan(topic: string, grade: string, duration: string): Promise<string> {
    const prompt = `Create a comprehensive lesson plan for topic "${topic}", targeted at ${grade} students for a ${duration} session. Include Objectives, Main Concepts, Activity, and Assessment.`;
    const system = 'You are an AI Master Educator assisting teachers in building structured curriculum lesson plans.';
    return aiHelpers.generateCompletion(prompt, system);
  }

  async generateAiAssignmentQuestions(topic: string, numQuestions = 5): Promise<string> {
    const prompt = `Generate ${numQuestions} progressive assignment questions (with model answers) for students on the topic "${topic}". Include short answer and scenario-based questions.`;
    const system = 'You are an AI Assessment Expert creating high-quality homework and quiz questions for students.';
    return aiHelpers.generateCompletion(prompt, system);
  }
}

export const courseService = new CourseService();
