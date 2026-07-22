import { Exam, Result, ExamType } from '@ai-lms/database';
import { PaginationInput, PaginationMeta } from '@ai-lms/shared';
import { examRepository } from './exam.repository';
import { aiHelpers } from '@/infrastructure/ai/openai.client';
import { NotFoundError } from '@/shared/errors/app-errors';
import { buildPaginationMeta } from '@/shared/utils/response.util';
import { logger } from '@/shared/utils/logger';

export class ExamService {
  async getExams(
    schoolId: string,
    params: PaginationInput,
  ): Promise<{ exams: any[]; meta: PaginationMeta }> {
    const { exams, total } = await examRepository.findExams(schoolId, params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { exams, meta };
  }

  async getExamById(id: string): Promise<any> {
    const exam = await examRepository.findExamById(id);
    if (!exam) throw new NotFoundError('Exam record not found');
    return exam;
  }

  async createExam(data: {
    termId: string;
    subjectId: string;
    classId: string;
    title: string;
    type: ExamType;
    totalMarks: number;
    passingMarks: number;
    scheduledAt: string;
    duration: number;
  }): Promise<Exam> {
    const exam = await examRepository.createExam({
      ...data,
      scheduledAt: new Date(data.scheduledAt),
    });
    logger.info({ examId: exam.id, title: exam.title }, 'Exam scheduled');
    return exam;
  }

  async recordResult(data: {
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
  }): Promise<Result> {
    await this.getExamById(data.examId);
    return examRepository.recordResult(data);
  }

  async explainAnswerWithAi(question: string, studentAnswer: string, correctAnswer: string): Promise<string> {
    const prompt = `Explain why the correct answer to question "${question}" is "${correctAnswer}". The student answered "${studentAnswer}". Provide encouraging, constructive feedback explaining the concepts clearly.`;
    const system = 'You are an empathetic, expert AI Tutor giving post-exam feedback and answer explanations.';
    return aiHelpers.generateCompletion(prompt, system);
  }
}

export const examService = new ExamService();
