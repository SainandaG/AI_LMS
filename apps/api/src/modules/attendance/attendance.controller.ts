import { Request, Response } from 'express';
import { AttendanceStatus } from '@ai-lms/database';
import { z } from 'zod';

import { attendanceService } from './attendance.service';
import { sendSuccess } from '@/shared/utils/response.util';

export class AttendanceController {
  async markBulkAttendance(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      classId: z.string().uuid(),
      date: z.string(),
      records: z.array(
        z.object({
          studentId: z.string().uuid(),
          status: z.nativeEnum(AttendanceStatus),
          note: z.string().optional(),
        }),
      ),
    });

    const { classId, date, records } = schema.parse(req.body);
    const markedBy = req.user!.sub;

    const formattedRecords = records.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      ...(r.note ? { note: r.note } : {}),
    }));

    const result = await attendanceService.markBulkAttendance(classId, date, markedBy, formattedRecords);
    sendSuccess(res, result, 'Attendance marked successfully');
  }

  async getClassAttendance(req: Request, res: Response): Promise<void> {
    const { classId, date } = req.query;
    const records = await attendanceService.getClassAttendance(String(classId), String(date));
    sendSuccess(res, records, 'Class attendance retrieved');
  }

  async getStudentAttendance(req: Request, res: Response): Promise<void> {
    const { studentId } = req.params;
    const records = await attendanceService.getStudentAttendance(studentId!);
    sendSuccess(res, records, 'Student attendance history retrieved');
  }
}

export const attendanceController = new AttendanceController();
