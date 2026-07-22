'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentDirectoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Students Directory
  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search],
    queryFn: async () => {
      const res = await apiClient.get('/students', {
        params: { page, limit: 12, search: search || undefined },
      });
      return res.data;
    },
  });

  const students = data?.data ?? [];
  const meta = data?.meta;

  // Admit Student Mutation
  const { register, handleSubmit, reset } = useForm();

  const admitStudentMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiClient.post('/students', formData);
      return res.data.data;
    },
    onSuccess: (newStudent) => {
      toast.success(`Student admitted! Roll Number: ${newStudent.rollNumber}`);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to admit student');
    },
  });

  const onAdmitSubmit = (data: any) => {
    admitStudentMutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-emerald-DEFAULT" /> Student Directory
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-DEFAULT/15 text-emerald-light border border-emerald-DEFAULT/30 ml-1">SIS</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage student admissions, profiles, roll numbers, and academic enrollments
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="glow" className="gap-2 shadow-lg">
          <Plus className="w-4 h-4" /> Admit Student
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search student name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {meta && (
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{students.length}</span> of{' '}
            <span className="font-semibold text-foreground">{meta.total}</span> students
          </div>
        )}
      </div>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 skeleton rounded-3xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card className="glass-card border-dashed border-2 border-white/10 p-12 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-DEFAULT/10 border border-emerald-DEFAULT/20 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 text-emerald-light" />
            </div>
            <p className="text-lg font-bold text-foreground">No Students Enrolled Yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Admit your first student to populate the Student Information System and begin tracking academic progress.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="glow" className="mt-2 gap-2">
              <Plus className="w-4 h-4" /> Admit First Student
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student: any) => {
            const user = student.user || {};
            const enrollment = student.enrollments?.[0];

            return (
              <Card
                key={student.id}
                className="glass-card border border-white/10 hover-lift group hover:border-emerald-DEFAULT/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-ai flex items-center justify-center font-black text-sm text-white shadow-lg shadow-brand-500/25 shrink-0">
                      {getInitials(user.firstName || 'S', user.lastName || 'T')}
                    </div>

                    <div className="overflow-hidden">
                      <CardTitle className="text-base font-bold truncate group-hover:text-emerald-light transition-colors">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/25">
                          {student.rollNumber}
                        </span>
                        {enrollment?.class && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white/[0.05] text-muted-foreground border border-white/10">
                            {enrollment.class.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-muted-foreground pt-0 border-t border-white/10 mt-1 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-DEFAULT shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-DEFAULT shrink-0" />
                    <span>Admitted: {new Date(student.admissionDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!meta.hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-xs font-medium px-3">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta.hasNextPage}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Admission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-lg glass-strong border border-white/20 relative animate-fade-in-up shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-DEFAULT to-brand-500 flex items-center justify-center text-white glow-emerald">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Admit New Student</CardTitle>
                  <CardDescription className="text-xs">Register student in the SIS portal</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onAdmitSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-semibold">First Name</Label>
                    <Input id="firstName" placeholder="Rahul" required className="bg-white/[0.04] border-white/10" {...register('firstName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-semibold">Last Name</Label>
                    <Input id="lastName" placeholder="Sharma" required className="bg-white/[0.04] border-white/10" {...register('lastName')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <Input id="email" type="email" placeholder="rahul@student.edu" required className="bg-white/[0.04] border-white/10" {...register('email')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rollNumber" className="text-xs font-semibold">Roll Number</Label>
                    <Input id="rollNumber" placeholder="S-2025-042" className="font-mono bg-white/[0.04] border-white/10" required {...register('rollNumber')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admissionDate" className="text-xs font-semibold">Admission Date</Label>
                    <Input id="admissionDate" type="date" required className="bg-white/[0.04] border-white/10 text-foreground" {...register('admissionDate')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone (Optional)</Label>
                    <Input id="phone" placeholder="+919876543210" className="bg-white/[0.04] border-white/10" {...register('phone')} />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-brand-400" />
                  Default password will be set to{' '}
                  <code className="font-mono bg-black/30 px-2 py-0.5 rounded-lg border border-white/10">Student@123</code>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="glow" disabled={admitStudentMutation.isPending} className="gap-2">
                    {admitStudentMutation.isPending ? 'Admitting...' : <><UserCheck className="w-4 h-4" /> Admit Student</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
