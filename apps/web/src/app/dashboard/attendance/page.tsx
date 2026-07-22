'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type StatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState<Record<string, StatusType>>({});

  // Fetch Students for attendance sheet
  const { data: studentRes, isLoading } = useQuery({
    queryKey: ['students-for-attendance'],
    queryFn: async () => {
      const res = await apiClient.get('/students', { params: { limit: 50 } });
      return res.data.data;
    },
  });

  const students = studentRes ?? [];

  // Bulk Mark Attendance Mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await apiClient.post('/attendance/mark', {
        classId: '00000000-0000-0000-0000-000000000000', // Demo class ID placeholder
        date: selectedDate,
        records,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Daily attendance saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    },
  });

  const handleStatusChange = (studentId: string, status: StatusType) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const setAllStatus = (status: StatusType) => {
    const nextState: Record<string, StatusType> = {};
    students.forEach((s: any) => {
      nextState[s.id] = status;
    });
    setAttendanceState(nextState);
  };

  // Stats calculation
  const total = students.length;
  const presentCount = Object.values(attendanceState).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceState).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceState).filter((s) => s === 'LATE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-400" /> Digital Attendance Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Mark daily class attendance, track student presence, and record absenteeism
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 h-10 text-xs font-semibold"
          />

          <Button
            onClick={() => markAttendanceMutation.mutate()}
            disabled={markAttendanceMutation.isPending || Object.keys(attendanceState).length === 0}
            className="gap-2"
          >
            <Save className="w-4 h-4" /> Save Sheet
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent text-foreground">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Students</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-green-400 font-medium">Present</p>
              <p className="text-xl font-bold text-green-400">{presentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-red-400 font-medium">Absent</p>
              <p className="text-xl font-bold text-red-400">{absentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-yellow-400 font-medium">Late</p>
              <p className="text-xl font-bold text-yellow-400">{lateCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Mark All Buttons */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-muted-foreground">Quick Mark All:</span>
        <button
          onClick={() => setAllStatus('PRESENT')}
          className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
        >
          All Present
        </button>
        <button
          onClick={() => setAllStatus('ABSENT')}
          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          All Absent
        </button>
      </div>

      {/* Attendance Table */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 skeleton rounded-xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No students enrolled in this class to mark attendance.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {students.map((student: any) => {
                const user = student.user || {};
                const currentStatus = attendanceState[student.id] ?? 'PRESENT';

                return (
                  <div key={student.id} className="p-4 flex items-center justify-between gap-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(user.firstName || 'S', user.lastName || 'T')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          ROLL: {student.rollNumber}
                        </p>
                      </div>
                    </div>

                    {/* Status Radio Group */}
                    <div className="flex items-center gap-1">
                      {[
                        { status: 'PRESENT', label: 'Present', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
                        { status: 'ABSENT', label: 'Absent', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
                        { status: 'LATE', label: 'Late', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
                        { status: 'EXCUSED', label: 'Excused', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
                      ].map((st) => (
                        <button
                          key={st.status}
                          type="button"
                          onClick={() => handleStatusChange(student.id, st.status as StatusType)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            currentStatus === st.status
                              ? `${st.color} shadow-sm`
                              : 'border-border/60 text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
