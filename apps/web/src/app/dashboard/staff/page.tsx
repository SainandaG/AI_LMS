'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Mail,
  Briefcase,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FacultyStaffDirectoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Faculty Directory
  const { data, isLoading } = useQuery({
    queryKey: ['teachers', page, search],
    queryFn: async () => {
      const res = await apiClient.get('/teachers', {
        params: { page, limit: 12, search: search || undefined },
      });
      return res.data;
    },
  });

  const teachers = data?.data ?? [];
  const meta = data?.meta;

  // Onboard Teacher Mutation
  const { register, handleSubmit, reset } = useForm();

  const onboardMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiClient.post('/teachers', formData);
      return res.data.data;
    },
    onSuccess: (newTeacher) => {
      toast.success(`Faculty member onboarded! Emp ID: ${newTeacher.employeeId}`);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to onboard faculty member');
    },
  });

  const onOnboardSubmit = (data: any) => {
    onboardMutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" /> Faculty & Staff Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage teachers, department assignments, qualifications, and employee profiles
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Onboard Faculty
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search faculty name or email..."
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
            Showing <span className="font-semibold text-foreground">{teachers.length}</span> of{' '}
            <span className="font-semibold text-foreground">{meta.total}</span> faculty members
          </div>
        )}
      </div>

      {/* Teacher Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 skeleton rounded-2xl" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center">
          <CardContent className="space-y-3">
            <Users className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-base font-semibold text-foreground">No Faculty Members Onboarded</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Onboard your teachers and staff to manage department schedules and subject assignments.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-2">
              Onboard First Teacher
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher: any) => {
            const user = teacher.user || {};

            return (
              <Card
                key={teacher.id}
                className="border-border/60 hover:border-brand-500/50 transition-all group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand-500/20 shrink-0">
                      {getInitials(user.firstName || 'T', user.lastName || 'F')}
                    </div>

                    <div className="overflow-hidden">
                      <CardTitle className="text-base font-bold truncate group-hover:text-brand-400 transition-colors">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          EMP: {teacher.employeeId}
                        </span>
                        {teacher.department && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-accent text-muted-foreground">
                            {teacher.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {teacher.qualification && (
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">{teacher.qualification}</span>
                    </div>
                  )}
                  {teacher.experience !== null && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span>{teacher.experience} years experience</span>
                    </div>
                  )}
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

      {/* Onboard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border relative animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-brand-400" /> Onboard Faculty
                </CardTitle>
                <CardDescription>Register a new teacher or staff member</CardDescription>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onOnboardSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Dr. Sarah" required {...register('firstName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Connor" required {...register('lastName')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sarah@institution.edu"
                      required
                      {...register('email')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      placeholder="EMP-042"
                      className="font-mono"
                      required
                      {...register('employeeId')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      placeholder="Ph.D. Computer Science"
                      {...register('qualification')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Joining Date</Label>
                    <Input id="joinDate" type="date" required {...register('joinDate')} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={onboardMutation.isPending}>
                    {onboardMutation.isPending ? 'Onboarding...' : 'Onboard Faculty'}
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
