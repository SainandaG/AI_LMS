import { Attendance, AttendanceStatus } from '@ai-lms/database';
import { attendanceRepository } from './attendance.repository';
import { logger } from '@/shared/utils/logger';

export class AttendanceService {
  async markBulkAttendance(
    classId: string,
    dateStr: string,
    markedBy: string,
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>,
  ): Promise<Attendance[]> {
    const date = new Date(dateStr);

    const promises = records.map((r) =>
      attendanceRepository.markAttendance({
        studentId: r.studentId,
        classId,
        date,
        status: r.status,
        markedBy,
        ...(r.note ? { note: r.note } : {}),
      }),
    );

    const results = await Promise.all(promises);
    logger.info({ classId, date: dateStr, count: results.length }, 'Bulk attendance marked');
    return results;
  }

  async getClassAttendance(classId: string, dateStr: string): Promise<Attendance[]> {
    return attendanceRepository.getClassAttendance(classId, new Date(dateStr));
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    return attendanceRepository.getStudentAttendanceHistory(studentId);
  }
}

export const attendanceService = new AttendanceService();
