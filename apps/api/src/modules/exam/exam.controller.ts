import { Request, Response } from 'express';
import { PaginationSchema } from '@ai-lms/shared';
import { ExamType } from '@ai-lms/database';
import { z } from 'zod';

import { examService } from './exam.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class ExamController {
  async getExams(req: Request, res: Response): Promise<void> {
    const params = PaginationSchema.parse(req.query);
    const schoolId = req.user!.schoolId!;

    const { exams, meta } = await examService.getExams(schoolId, params);
    sendSuccess(res, exams, 'Exams list retrieved', 200, meta);
  }

  async getExamById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const exam = await examService.getExamById(id!);
    sendSuccess(res, exam, 'Exam details retrieved');
  }

  async createExam(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      termId: z.string().uuid(),
      subjectId: z.string().uuid(),
      classId: z.string().uuid(),
      title: z.string().min(2),
      type: z.nativeEnum(ExamType),
      totalMarks: z.number().int().min(1),
      passingMarks: z.number().int().min(1),
      scheduledAt: z.string(),
      duration: z.number().int().min(5),
    });

    const body = schema.parse(req.body);
    const exam = await examService.createExam(body);
    sendCreated(res, exam, 'Exam created successfully');
  }

  async recordResult(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      examId: z.string().uuid(),
      studentId: z.string().uuid(),
      marksObtained: z.number().min(0),
      remarks: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const result = await examService.recordResult({
      examId: body.examId,
      studentId: body.studentId,
      marksObtained: body.marksObtained,
      ...(body.remarks ? { remarks: body.remarks } : {}),
    });

    sendSuccess(res, result, 'Student result recorded');
  }

  async explainAnswerWithAi(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      question: z.string().min(2),
      studentAnswer: z.string(),
      correctAnswer: z.string(),
    });

    const { question, studentAnswer, correctAnswer } = schema.parse(req.body);
    const explanation = await examService.explainAnswerWithAi(question, studentAnswer, correctAnswer);
    sendSuccess(res, { explanation }, 'AI answer explanation generated');
  }
}

export const examController = new ExamController();
