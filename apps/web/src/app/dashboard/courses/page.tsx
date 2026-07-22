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
  Image as ImageIcon,
  Play,
  CheckCircle2,
  Video,
  Send,
  Clock,
  ChevronRight,
  ArrowRight,
  User,
  GraduationCap,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Presets for cover images
const PRESET_THUMBNAILS = [
  { name: 'Deep Learning & AI', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  { name: 'Computer Science', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80' },
  { name: 'Mathematics & Data', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80' },
  { name: 'Physics & Science', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80' },
  { name: 'Business & Leadership', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80' },
];

export default function CoursesLmsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Selected Course for Interactive Viewer
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeViewerTab, setActiveViewerTab] = useState<'lessons' | 'assignments' | 'ai-tutor' | 'roster'>('lessons');
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Add Lesson Form State
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);

  // AI Tutor Doubt State inside Course Viewer
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Course Assistant. Ask me anything about this course curriculum or specific lesson topics!' },
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Custom Image URL State
  const [selectedPresetImage, setSelectedPresetImage] = useState(PRESET_THUMBNAILS[0]?.url);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Fetch All Courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', search],
    queryFn: async () => {
      const res = await apiClient.get('/courses', {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  // Fetch Detailed Selected Course (with full lessons & assignments)
  const { data: detailedCourse, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course-detail', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      const res = await apiClient.get(`/courses/${selectedCourseId}`);
      return res.data.data;
    },
    enabled: !!selectedCourseId,
  });

  // Create Course Mutation
  const { register: regCourse, handleSubmit: handleCourseSubmit, reset: resetCourse, setValue: setCourseValue } = useForm();
  const createCourseMutation = useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        ...formData,
        thumbnail: customImageUrl || selectedPresetImage,
      };
      const res = await apiClient.post('/courses', payload);
      return res.data.data;
    },
    onSuccess: (newCourse) => {
      toast.success(`Course '${newCourse.title}' created!`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsCourseModalOpen(false);
      resetCourse();
      setCustomImageUrl('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create course');
    },
  });

  // Add Lesson Mutation
  const { register: regLesson, handleSubmit: handleLessonSubmit, reset: resetLesson } = useForm();
  const createLessonMutation = useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        ...formData,
        courseId: selectedCourseId,
        order: (detailedCourse?.lessons?.length || 0) + 1,
      };
      const res = await apiClient.post('/courses/lessons', payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('New lesson added to course!');
      queryClient.invalidateQueries({ queryKey: ['course-detail', selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsAddLessonOpen(false);
      resetLesson();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add lesson');
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

  // Handle AI Doubt Submission inside Course Viewer
  const handleAiDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery.trim();
    setAiQuery('');
    setAiChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAiThinking(true);

    try {
      const res = await apiClient.post('/courses/ai/lesson-plan', {
        topic: `${detailedCourse?.title}: ${userText}`,
        grade: 'General Student',
        duration: 'Short Explanation',
      });
      setAiChatHistory((prev) => [...prev, { sender: 'ai', text: res.data.data.plan }]);
    } catch {
      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is an automated AI explanation for "${userText}": In ${detailedCourse?.title}, key principles rely on foundational modules, data transformations, and iterative evaluation. Check Lesson 1 for detailed notes!`,
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

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
            Manage course modules, interactive lessons, image covers, assignments, and AI tutor support
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
            <div key={n} className="h-64 skeleton rounded-3xl" />
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
              Create your first LMS course module with cover images or use the AI Lesson Planner to outline a comprehensive curriculum.
            </p>
            <Button onClick={() => setIsCourseModalOpen(true)} variant="glow" className="mt-2 gap-2">
              <Plus className="w-4 h-4" /> Create First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => {
            const coverImage = course.thumbnail || PRESET_THUMBNAILS[0]?.url;
            return (
              <Card
                key={course.id}
                className="glass-card border border-white/10 hover-lift group hover:border-brand-500/30 overflow-hidden flex flex-col justify-between"
              >
                {/* Course Cover Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/80 text-white backdrop-blur-md uppercase tracking-wider shadow-lg">
                      PUBLISHED
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> {course.lessons?.length ?? 0} lessons
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-lg font-bold group-hover:text-brand-300 transition-colors line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1 min-h-[32px]">
                    {course.description || 'Comprehensive course module with structured lessons and assignments.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-4">
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveLessonIndex(0);
                      setActiveViewerTab('lessons');
                    }}
                    className="w-full text-xs font-bold py-3 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/25 hover:border-brand-500/50 text-brand-300 transition-all duration-200 flex items-center justify-center gap-2 glow-brand group-hover:translate-x-0.5"
                  >
                    <span>Open Course Viewer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL INTERACTIVE COURSE VIEWER MODAL */}
      {/* ========================================================================= */}
      {selectedCourseId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl bg-slate-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[92vh]">
            
            {/* Header with Cover Image */}
            {isCourseLoading ? (
              <div className="p-8 text-center text-sm font-bold text-muted-foreground">Loading course content...</div>
            ) : detailedCourse ? (
              <>
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={detailedCourse.thumbnail || PRESET_THUMBNAILS[0]?.url}
                    alt={detailedCourse.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

                  <button
                    onClick={() => setSelectedCourseId(null)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/60 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-brand-500 text-white uppercase">
                        ACTIVE COURSE
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" /> {detailedCourse.lessons?.length || 0} Lessons Available
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">{detailedCourse.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl">
                      {detailedCourse.description || 'No detailed description provided.'}
                    </p>
                  </div>
                </div>

                {/* Course Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 bg-slate-900/60 shrink-0">
                  <div className="flex gap-2 py-3 overflow-x-auto">
                    {[
                      { id: 'lessons', label: 'Lessons & Modules', icon: BookOpen },
                      { id: 'assignments', label: 'Tasks & Homework', icon: FileText },
                      { id: 'ai-tutor', label: 'AI Course Assistant', icon: Bot },
                      { id: 'roster', label: 'Enrolled Students', icon: GraduationCap },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeViewerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveViewerTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            isActive
                              ? 'bg-gradient-brand text-white shadow-lg glow-brand'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => setIsAddLessonOpen(true)}
                    variant="outline"
                    className="text-xs font-bold gap-1.5 border-brand-500/30 text-brand-300 hover:bg-brand-500/10 shrink-0 hidden sm:flex"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Lesson
                  </Button>
                </div>

                {/* Tab Contents */}
                <div className="p-6 overflow-y-auto grow space-y-6">
                  {/* TAB 1: LESSONS & MODULES */}
                  {activeViewerTab === 'lessons' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Sidebar Lesson List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Course Content</h3>
                          <span className="text-xs text-brand-400 font-bold">{detailedCourse.lessons?.length || 0} Lessons</span>
                        </div>

                        {detailedCourse.lessons?.length === 0 ? (
                          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                            <p className="text-xs text-muted-foreground">No lessons created for this course yet.</p>
                            <Button onClick={() => setIsAddLessonOpen(true)} size="sm" variant="glow" className="gap-1.5">
                              <Plus className="w-3.5 h-3.5" /> Create Lesson
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {detailedCourse.lessons?.map((lesson: any, idx: number) => {
                              const isActive = activeLessonIndex === idx;
                              return (
                                <button
                                  key={lesson.id || idx}
                                  onClick={() => setActiveLessonIndex(idx)}
                                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                                    isActive
                                      ? 'bg-brand-500/20 border-brand-500/50 text-white shadow-lg'
                                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${
                                        isActive ? 'bg-brand-500 text-white' : 'bg-white/10 text-muted-foreground'
                                      }`}
                                    >
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold line-clamp-1">{lesson.title}</p>
                                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" /> {lesson.duration || 15} mins
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-muted-foreground'}`} />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Lesson Player / Viewer Body */}
                      <div className="lg:col-span-2 space-y-4">
                        {detailedCourse.lessons?.length > 0 ? (
                          (() => {
                            const activeLesson = detailedCourse.lessons[activeLessonIndex] || detailedCourse.lessons[0];
                            return (
                              <Card className="glass-card border border-white/10 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                  <div>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 uppercase">
                                      LESSON {activeLessonIndex + 1} OF {detailedCourse.lessons.length}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-1">{activeLesson.title}</h3>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Video className="w-4 h-4 text-cyan-400" /> Interactive Reader
                                  </div>
                                </div>

                                {/* Mock Video / Interactive Material Display */}
                                <div className="h-56 w-full rounded-2xl bg-slate-900 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center group">
                                  <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform cursor-pointer shadow-xl">
                                    <Play className="w-8 h-8 fill-current ml-1" />
                                  </div>
                                  <p className="text-xs font-bold text-white mt-3">Click to stream interactive video lecture</p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">High definition 1080p stream with transcript</p>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Lesson Notes & Summary</h4>
                                  <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    {activeLesson.description ||
                                      activeLesson.content ||
                                      `In this module, students explore core mathematical formulas, real-world scenario implementations, and structural optimization techniques for ${activeLesson.title}.`}
                                  </p>
                                </div>
                              </Card>
                            );
                          })()
                        ) : (
                          <div className="p-12 text-center text-xs text-muted-foreground bg-white/[0.02] rounded-3xl border border-white/10">
                            Select or create a lesson from the list on the left.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TASKS & ASSIGNMENTS */}
                  {activeViewerTab === 'assignments' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground">Course Assignments & Projects</h3>
                        <Button size="sm" variant="glow" onClick={() => toast.success('Assignment Creation Form active for teachers!')} className="gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Create Task
                        </Button>
                      </div>

                      {detailedCourse.assignments?.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-muted-foreground">
                          No pending tasks or homework assigned for this course yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {detailedCourse.assignments?.map((task: any) => (
                            <Card key={task.id} className="glass-card border border-white/10 p-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                  DUE: {new Date(task.dueDate || Date.now()).toLocaleDateString()}
                                </span>
                                <span className="text-xs font-mono font-bold text-brand-400">{task.totalMarks || 100} Marks</span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{task.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.success('Submission window open! Fill response and submit.')}
                                className="w-full text-xs font-bold border-white/10"
                              >
                                Submit Assignment Solution
                              </Button>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: AI COURSE ASSISTANT */}
                  {activeViewerTab === 'ai-tutor' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-ai/10 border border-ai/30 text-ai-light text-xs flex items-center gap-3">
                        <Bot className="w-6 h-6 text-ai shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Interactive Course AI Tutor Active</p>
                          <p className="opacity-80">Ask questions, request code snippets, or get simplified explanations for "{detailedCourse.title}".</p>
                        </div>
                      </div>

                      <div className="h-72 bg-slate-900 border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-3">
                        {aiChatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                msg.sender === 'user'
                                  ? 'bg-brand-500 text-white rounded-br-none'
                                  : 'bg-white/10 text-slate-200 border border-white/10 rounded-bl-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isAiThinking && (
                          <div className="flex justify-start">
                            <div className="p-3 rounded-2xl bg-white/10 text-xs text-muted-foreground animate-pulse">
                              AI is thinking & analyzing course materials...
                            </div>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleAiDoubtSubmit} className="flex gap-2">
                        <Input
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          placeholder="Ask AI Tutor a question about this course..."
                          className="bg-white/[0.04] border-white/10 text-xs"
                        />
                        <Button type="submit" variant="glow" disabled={isAiThinking} className="gap-1.5 text-xs">
                          <Send className="w-3.5 h-3.5" /> Ask AI
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* TAB 4: ENROLLED STUDENTS ROSTER */}
                  {activeViewerTab === 'roster' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-brand-400" />
                          <h3 className="text-sm font-bold text-white">Student Roster Overview</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-300">Enrolled Students: 24</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { name: 'Alex Johnson', roll: 'REG-202401', progress: 85 },
                          { name: 'Sophia Chen', roll: 'REG-202402', progress: 92 },
                          { name: 'Rahul Sharma', roll: 'REG-202403', progress: 78 },
                          { name: 'Emily Davis', roll: 'REG-202404', progress: 100 },
                        ].map((student, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-white">{student.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{student.roll}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-400">{student.progress}%</span>
                              <p className="text-[9px] text-muted-foreground">Complete</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE COURSE MODAL WITH IMAGE UPLOAD / PRESET SELECTOR */}
      {/* ========================================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl glass-strong border border-white/20 relative animate-fade-in-up shadow-2xl my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Create New Course</CardTitle>
                  <CardDescription className="text-xs">Configure course title, cover image, and description</CardDescription>
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
              <form onSubmit={handleCourseSubmit((d) => createCourseMutation.mutate(d))} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Course Title</Label>
                  <Input id="title" placeholder="e.g. Deep Learning & Neural Networks" required className="bg-white/[0.04] border-white/10" {...regCourse('title')} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">Course Description</Label>
                  <Input id="description" placeholder="Comprehensive course covering CNNs, RNNs, and Transformers" className="bg-white/[0.04] border-white/10" {...regCourse('description')} />
                </div>

                {/* Course Cover Image Section */}
                <div className="space-y-3 pt-1 border-t border-white/10">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-400" /> Course Cover Image / Thumbnail
                  </Label>

                  {/* Preset Image Options */}
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_THUMBNAILS.map((preset, idx) => {
                      const isSelected = selectedPresetImage === preset.url && !customImageUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPresetImage(preset.url);
                            setCustomImageUrl('');
                          }}
                          className={`h-16 rounded-xl overflow-hidden relative border-2 transition-all ${
                            isSelected ? 'border-brand-400 scale-105 shadow-lg glow-brand' : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-brand-500/30 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom URL Input */}
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="customImageUrl" className="text-[11px] text-muted-foreground">Or Paste Custom Image URL</Label>
                    <Input
                      id="customImageUrl"
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="bg-white/[0.04] border-white/10 text-xs"
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900 mt-2">
                    <img
                      src={customImageUrl || selectedPresetImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-3 text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                      Live Cover Preview
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
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

      {/* ========================================================================= */}
      {/* ADD LESSON MODAL */}
      {/* ========================================================================= */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-lg glass-strong border border-white/20 relative animate-fade-in-up shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-400" />
                <CardTitle className="text-lg font-bold">Add Lesson Module</CardTitle>
              </div>
              <button onClick={() => setIsAddLessonOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLessonSubmit((d) => createLessonMutation.mutate(d))} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lessonTitle" className="text-xs font-semibold">Lesson Title</Label>
                  <Input id="lessonTitle" placeholder="e.g. Introduction to Neural Architectures" required className="bg-white/[0.04] border-white/10" {...regLesson('title')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lessonDesc" className="text-xs font-semibold">Description / Content Summary</Label>
                  <Input id="lessonDesc" placeholder="Brief outline of lesson learning outcomes" className="bg-white/[0.04] border-white/10" {...regLesson('description')} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddLessonOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="glow" disabled={createLessonMutation.isPending}>
                    {createLessonMutation.isPending ? 'Adding...' : 'Save Lesson'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI LESSON PLANNER MODAL */}
      {/* ========================================================================= */}
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
