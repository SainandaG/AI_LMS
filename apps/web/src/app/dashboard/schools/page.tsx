'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSchoolSchema, CreateSchoolInput, School } from '@ai-lms/shared';
import toast from 'react-hot-toast';
import {
  School as SchoolIcon,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolsManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Schools
  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      const res = await apiClient.get('/schools');
      return res.data.data;
    },
  });

  // Create School Mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (data: CreateSchoolInput) => {
      const res = await apiClient.post('/schools', data);
      return res.data.data;
    },
    onSuccess: (newSchool) => {
      toast.success(`School '${newSchool.name}' registered successfully!`);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create school');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSchoolInput>({
    resolver: zodResolver(CreateSchoolSchema),
  });

  const onSubmit = (data: CreateSchoolInput) => {
    createSchoolMutation.mutate(data);
  };

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-400" /> Institution Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage multi-tenant schools, campuses, and institution profiles
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add New School
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by school name or code..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Schools Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filteredSchools.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center">
          <CardContent className="space-y-3">
            <SchoolIcon className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-base font-semibold text-foreground">No Schools Found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Get started by registering your first tenant institution or school campus.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-2">
              Create First School
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="border-border/60 hover:border-brand-500/50 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand-500/20">
                    {school.code.substring(0, 3)}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      school.isActive
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {school.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Inactive
                      </>
                    )}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-3 group-hover:text-brand-400 transition-colors">
                  {school.name}
                </CardTitle>
                <CardDescription className="text-xs font-mono">CODE: {school.code}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{school.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{school.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{school.email}</span>
                </div>
                {school.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-400 hover:underline truncate"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border relative animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Register Institution</CardTitle>
                <CardDescription>Add a new school or campus tenant</CardDescription>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">School Name</Label>
                    <Input
                      id="name"
                      placeholder="St. Xavier High School"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">School Code</Label>
                    <Input
                      id="code"
                      placeholder="STX-01"
                      className="font-mono uppercase"
                      error={errors.code?.message}
                      {...register('code')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Education Blvd, City"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+919876543210"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Official Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@school.edu"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    placeholder="https://school.edu"
                    error={errors.website?.message}
                    {...register('website')}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSchoolMutation.isPending}>
                    {createSchoolMutation.isPending ? 'Registering...' : 'Register School'}
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
