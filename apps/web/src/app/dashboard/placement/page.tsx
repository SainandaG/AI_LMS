'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Plus,
  Search,
  Building,
  Sparkles,
  Bot,
  Award,
  X,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlacementPortalPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isAiResumeOpen, setIsAiResumeOpen] = useState(false);

  const [resumeText, setResumeText] = useState('');
  const [aiResult, setAiResult] = useState<{ score: number; feedback: string } | null>(null);

  // Fetch Companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', search],
    queryFn: async () => {
      const res = await apiClient.get('/placement/companies', {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  // Add Company Mutation
  const { register, handleSubmit, reset } = useForm();
  const addCompanyMutation = useMutation({
    mutationFn: async (formData: any) => {
      const data = {
        ...formData,
        requiredSkills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : [],
      };
      const res = await apiClient.post('/placement/companies', data);
      return res.data.data;
    },
    onSuccess: (newCompany) => {
      toast.success(`Recruitment drive for '${newCompany.name}' listed!`);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCompanyModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to list company');
    },
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const res = await apiClient.post('/placement/apply', { companyId });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Successfully submitted placement application!');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Application failed');
    },
  });

  // AI Resume Analyzer Mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/placement/ai/analyze-resume', { resumeText });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAiResult(data);
      toast.success(`AI Analysis complete! Score: ${data.score}/100`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Resume analysis failed');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-400" /> Placement & Career Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse campus recruitment drives, submit applications, and analyze resumes with AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setAiResult(null);
              setIsAiResumeOpen(true);
            }}
            variant="outline"
            className="gap-2 border-ai/50 text-ai hover:bg-ai/10"
          >
            <Bot className="w-4 h-4 text-ai" /> AI Resume Scorer
          </Button>

          <Button onClick={() => setIsCompanyModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> List Recruitment Drive
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by company name or industry..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Company Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 skeleton rounded-2xl" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center">
          <CardContent className="space-y-3">
            <Building className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-base font-semibold text-foreground">No Active Drives Listed</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              List your institution's corporate partners and campus placement drives.
            </p>
            <Button onClick={() => setIsCompanyModalOpen(true)} variant="outline" className="mt-2">
              List First Drive
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp: any) => (
            <Card
              key={comp.id}
              className="border-border/60 hover:border-brand-500/50 transition-all group flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {comp.industry}
                  </span>
                  {comp.minCgpa && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-yellow-400" /> Min CGPA: {comp.minCgpa}
                    </span>
                  )}
                </div>

                <CardTitle className="text-lg font-bold mt-2 group-hover:text-brand-400 transition-colors">
                  {comp.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {comp.description || 'Campus recruitment drive open for eligible students.'}
                </CardDescription>

                {comp.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {comp.requiredSkills.map((sk: string) => (
                      <span
                        key={sk}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent text-muted-foreground border border-border/40"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  onClick={() => applyMutation.mutate(comp.id)}
                  disabled={applyMutation.isPending}
                  className="w-full text-xs font-semibold"
                >
                  Apply to Drive →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List Drive Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border relative animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold">List Recruitment Drive</CardTitle>
                <CardDescription>Add a hiring partner company for campus placements</CardDescription>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit((d) => addCompanyMutation.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" placeholder="Google / Microsoft" required {...register('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="Software & Cloud" required {...register('industry')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills (Comma separated)</Label>
                  <Input id="skills" placeholder="React, Node.js, TypeScript, PostgreSQL" required {...register('skills')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minCgpa">Min Cutoff CGPA</Label>
                    <Input id="minCgpa" type="number" step="0.1" defaultValue={7.5} {...register('minCgpa', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input id="website" placeholder="https://careers.company.com" {...register('website')} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsCompanyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addCompanyMutation.isPending}>
                    {addCompanyMutation.isPending ? 'Listing...' : 'List Drive'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Resume Scorer Modal */}
      {isAiResumeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl border-ai/50 relative animate-fade-in my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ai/20 flex items-center justify-center text-ai border border-ai/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">AI Resume Scorer & Analyzer</CardTitle>
                  <CardDescription>Paste your resume text to get an instant recruitment score</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsAiResumeOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resumeText">Resume Content / Plain Text</Label>
                <textarea
                  id="resumeText"
                  rows={6}
                  placeholder="Paste your skills, experience, projects, education, and achievements here..."
                  className="w-full rounded-lg border border-border/80 bg-background/50 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              <Button
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending || !resumeText}
                className="w-full bg-ai hover:bg-ai/90 text-white font-semibold gap-2 shadow-lg shadow-ai/20"
              >
                <Bot className="w-4 h-4" />
                {resumeMutation.isPending ? 'Scoring Resume...' : 'Analyze Resume'}
              </Button>

              {aiResult && (
                <div className="p-4 rounded-xl border border-ai/30 bg-ai/5 space-y-3 text-xs mt-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-ai text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Recruitment Score
                    </span>
                    <span className="text-lg font-black text-foreground bg-ai/20 px-3 py-1 rounded-full border border-ai/40">
                      {aiResult.score} / 100
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-foreground/90 bg-background/50 p-4 rounded-lg border border-border/60 text-xs leading-relaxed max-h-64 overflow-y-auto">
                    {aiResult.feedback}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
