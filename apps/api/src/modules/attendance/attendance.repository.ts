import { prisma, Attendance, AttendanceStatus } from '@ai-lms/database';

export class AttendanceRepository {
  async markAttendance(data: {
    studentId: string;
    classId: string;
    date: Date;
    status: AttendanceStatus;
    note?: string;
    markedBy: string;
  }): Promise<Attendance> {
    return prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId: data.studentId,
          classId: data.classId,
          date: data.date,
        },
      },
      update: {
        status: data.status,
        markedBy: data.markedBy,
        ...(data.note !== undefined ? { note: data.note } : {}),
      },
      create: {
        studentId: data.studentId,
        classId: data.classId,
        date: data.date,
        status: data.status,
        markedBy: data.markedBy,
        ...(data.note ? { note: data.note } : {}),
      },
    });
  }

  async getClassAttendance(classId: string, date: Date): Promise<Attendance[]> {
    return prisma.attendance.findMany({
      where: { classId, date },
      include: {
        student: {
          include: { user: true },
        },
      },
    });
  }

  async getStudentAttendanceHistory(studentId: string): Promise<Attendance[]> {
    return prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 60,
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
