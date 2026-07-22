'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Plus,
  Search,
  Bot,
  Sparkles,
  FileText,
  X,
  BookMarked,
  Layers,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoursesLmsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Fetch Courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', search],
    queryFn: async () => {
      const res = await apiClient.get('/courses', {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  // Create Course Mutation
  const { register: regCourse, handleSubmit: handleCourseSubmit, reset: resetCourse } = useForm();
  const createCourseMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiClient.post('/courses', formData);
      return res.data.data;
    },
    onSuccess: (newCourse) => {
      toast.success(`Course '${newCourse.title}' created!`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsCourseModalOpen(false);
      resetCourse();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create course');
    },
  });

  // AI Planner Mutation
  const { register: regAi, handleSubmit: handleAiSubmit } = useForm();
  const aiPlannerMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiClient.post('/courses/ai/lesson-plan', formData);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAiResult(data.plan);
      toast.success('AI Lesson Plan generated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate AI plan');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-brand-400" /> Learning Management System
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30 ml-1">LMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage course modules, interactive lessons, assignments, and AI-generated lesson plans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setAiResult(null); setIsAiPlannerOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ai/40 bg-ai/10 text-ai-light hover:bg-ai/20 text-xs font-bold transition-all glow-ai"
          >
            <Bot className="w-4 h-4 text-ai" /> AI Lesson Planner
          </button>

          <Button onClick={() => setIsCourseModalOpen(true)} variant="glow" className="gap-2 shadow-lg">
            <Plus className="w-4 h-4" /> Create Course
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search course titles..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 skeleton rounded-3xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="glass-card border-dashed border-2 border-white/10 p-12 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto">
              <BookMarked className="w-8 h-8 text-brand-400" />
            </div>
            <p className="text-lg font-bold text-foreground">No Courses Available Yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Create your first LMS course module or use the AI Lesson Planner to outline a comprehensive curriculum.
            </p>
            <Button onClick={() => setIsCourseModalOpen(true)} variant="glow" className="mt-2 gap-2">
              <Plus className="w-4 h-4" /> Create First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card
              key={course.id}
              className="glass-card border border-white/10 hover-lift group hover:border-brand-500/30 flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-DEFAULT/15 text-emerald-light border border-emerald-DEFAULT/30 uppercase tracking-wider">
                    PUBLISHED
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-DEFAULT" /> {course.lessons?.length ?? 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-DEFAULT" /> {course.assignments?.length ?? 0} tasks
                    </span>
                  </div>
                </div>

                <CardTitle className="text-lg font-bold mt-3 group-hover:text-brand-300 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {course.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <button className="w-full text-xs font-bold py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-brand-500/15 hover:border-brand-500/30 hover:text-brand-300 transition-all duration-200">
                  Open Course Viewer →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-lg glass-strong border border-white/20 relative animate-fade-in-up shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Create New Course</CardTitle>
                  <CardDescription className="text-xs">Add a new module to the LMS catalog</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleCourseSubmit((d) => createCourseMutation.mutate(d))} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Course Title</Label>
                  <Input id="title" placeholder="Advanced Data Structures & Algorithms" required className="bg-white/[0.04] border-white/10" {...regCourse('title')} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">Course Description</Label>
                  <Input id="description" placeholder="Comprehensive course covering trees, graphs, and dynamic programming" className="bg-white/[0.04] border-white/10" {...regCourse('description')} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="glow" disabled={createCourseMutation.isPending} className="gap-2">
                    {createCourseMutation.isPending ? 'Creating...' : <><Plus className="w-4 h-4" /> Create Course</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Lesson Planner Modal */}
      {isAiPlannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl border-ai/50 relative animate-fade-in my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ai/20 flex items-center justify-center text-ai border border-ai/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">AI Lesson Planner</CardTitle>
                  <CardDescription>Generate structured lesson plans using OpenAI</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsAiPlannerOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <form onSubmit={handleAiSubmit((d) => aiPlannerMutation.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="topic">Topic / Subject</Label>
                    <Input id="topic" placeholder="e.g. Binary Search Trees & Balancing" required {...regAi('topic')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Target Grade</Label>
                    <Input id="grade" defaultValue="Grade 11" {...regAi('grade')} />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={aiPlannerMutation.isPending}
                  className="w-full bg-ai hover:bg-ai/90 text-white font-semibold gap-2 shadow-lg shadow-ai/20"
                >
                  <Bot className="w-4 h-4" />
                  {aiPlannerMutation.isPending ? 'Generating Curriculum Plan...' : 'Generate AI Plan'}
                </Button>
              </form>

              {aiResult && (
                <div className="p-4 rounded-xl border border-ai/30 bg-ai/5 space-y-2 text-xs">
                  <div className="font-bold text-ai flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4" /> Generated Plan Output:
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-foreground/90 bg-background/50 p-4 rounded-lg border border-border/60 text-xs leading-relaxed max-h-80 overflow-y-auto">
                    {aiResult}
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
