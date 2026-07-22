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
  Building2,
  MapPin,
  ArrowLeftRight,
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

  // Inter-Branch Transfer Modal State
  const [transferringTeacher, setTransferringTeacher] = useState<any | null>(null);
  const [targetSchoolId, setTargetSchoolId] = useState('');

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

  // Fetch All Institution Branches / Schools
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const res = await apiClient.get('/schools');
      return res.data.data;
    },
  });

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

  // Inter-Branch Transfer Mutation
  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!transferringTeacher || !targetSchoolId) {
        throw new Error('Please select a target branch');
      }
      const res = await apiClient.patch(`/teachers/${transferringTeacher.id}/transfer`, {
        targetSchoolId,
      });
      return res.data.data;
    },
    onSuccess: () => {
      const targetSchool = schools.find((s: any) => s.id === targetSchoolId);
      toast.success(`Faculty transferred successfully to ${targetSchool?.name || 'new branch'}!`);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setTransferringTeacher(null);
      setTargetSchoolId('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Branch transfer failed');
    },
  });

  const onOnboardSubmit = (data: any) => {
    onboardMutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-400" /> Faculty & Multi-Branch Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage faculty onboarding across Bangalore, Hyderabad & regional campuses with instant branch transfers
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="glow" className="gap-2 shadow-lg glow-brand">
          <Plus className="w-4 h-4" /> Onboard Faculty Member
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search faculty name or email..."
            className="pl-9 bg-white/[0.04] border-white/10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {meta && (
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-bold text-foreground">{teachers.length}</span> of{' '}
            <span className="font-bold text-foreground">{meta.total}</span> faculty members
          </div>
        )}
      </div>

      {/* Teacher Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-52 skeleton rounded-3xl" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <Card className="glass-card border-dashed border-2 border-white/10 p-12 text-center">
          <CardContent className="space-y-3">
            <Users className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-base font-bold text-foreground">No Faculty Members Found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Onboard your teachers and staff to assign them to specific institution campuses.
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
            const branch = user.school || { name: 'Main Campus', code: 'HQ-01' };

            return (
              <Card
                key={teacher.id}
                className="glass-card border border-white/10 hover-lift group flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand-500/20 shrink-0 glow-brand">
                      {getInitials(user.firstName || 'T', user.lastName || 'F')}
                    </div>

                    <div className="overflow-hidden">
                      <CardTitle className="text-base font-bold truncate group-hover:text-brand-300 transition-colors">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          EMP: {teacher.employeeId}
                        </span>
                        {teacher.department && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300">
                            {teacher.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-muted-foreground pt-0">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      {branch.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">({branch.code})</span>
                  </div>

                  <div className="space-y-1.5">
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
                  </div>

                  <button
                    onClick={() => {
                      setTransferringTeacher(teacher);
                      setTargetSchoolId('');
                    }}
                    className="w-full mt-2 text-xs font-bold py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-cyan-500/15 hover:border-cyan-500/30 text-cyan-300 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" /> Transfer Campus Branch
                  </button>
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

      {/* ========================================================================= */}
      {/* ONBOARD FACULTY MEMBER MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg glass-strong border border-white/20 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Onboard Faculty Member</CardTitle>
                  <CardDescription className="text-xs">Register new teacher & select assigned branch</CardDescription>
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
              <form onSubmit={handleSubmit(onOnboardSubmit)} className="space-y-4">
                {/* Branch Selection Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="schoolId" className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-cyan-400" /> Assign Campus Branch
                  </Label>
                  <select
                    id="schoolId"
                    {...register('schoolId')}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="" className="bg-card text-muted-foreground">-- Primary Institution Branch --</option>
                    {schools.map((s: any) => (
                      <option key={s.id} value={s.id} className="bg-card text-foreground">
                        📍 {s.name} ({s.code}) - {s.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-semibold">First Name</Label>
                    <Input id="firstName" placeholder="Dr. Sarah" required {...register('firstName')} className="bg-white/[0.04] border-white/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-semibold">Last Name</Label>
                    <Input id="lastName" placeholder="Connor" required {...register('lastName')} className="bg-white/[0.04] border-white/10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sarah@institution.edu"
                      required
                      {...register('email')}
                      className="bg-white/[0.04] border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="employeeId" className="text-xs font-semibold">Employee ID</Label>
                    <Input
                      id="employeeId"
                      placeholder="EMP-042"
                      className="font-mono bg-white/[0.04] border-white/10"
                      required
                      {...register('employeeId')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="qualification" className="text-xs font-semibold">Qualification</Label>
                    <Input
                      id="qualification"
                      placeholder="Ph.D. Computer Science"
                      {...register('qualification')}
                      className="bg-white/[0.04] border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="joinDate" className="text-xs font-semibold">Joining Date</Label>
                    <Input id="joinDate" type="date" required {...register('joinDate')} className="bg-white/[0.04] border-white/10" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="glow" disabled={onboardMutation.isPending}>
                    {onboardMutation.isPending ? 'Onboarding...' : 'Onboard Faculty'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTER-BRANCH TRANSFER MODAL */}
      {/* ========================================================================= */}
      {transferringTeacher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg glass-strong border border-cyan-500/30 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-500/40">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Inter-Branch Faculty Transfer</CardTitle>
                  <CardDescription className="text-xs">
                    Transfer {transferringTeacher.user?.firstName} {transferringTeacher.user?.lastName} to another campus
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => setTransferringTeacher(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  transferMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                  <span className="text-muted-foreground">Current Assigned Branch:</span>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    {transferringTeacher.user?.school?.name || 'Primary Campus'} ({transferringTeacher.user?.school?.code || 'HQ-01'})
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetSchool" className="text-xs font-semibold text-cyan-300">
                    Select Destination Campus Branch
                  </Label>
                  <select
                    id="targetSchool"
                    value={targetSchoolId}
                    onChange={(e) => setTargetSchoolId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="" className="bg-card text-muted-foreground">-- Select Destination Campus --</option>
                    {schools
                      .filter((s: any) => s.id !== transferringTeacher.user?.schoolId)
                      .map((s: any) => (
                        <option key={s.id} value={s.id} className="bg-card text-foreground">
                          📍 {s.name} ({s.code}) - {s.address}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setTransferringTeacher(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={transferMutation.isPending || !targetSchoolId}
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold gap-2"
                  >
                    {transferMutation.isPending ? 'Transferring...' : 'Confirm Campus Transfer'}
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
