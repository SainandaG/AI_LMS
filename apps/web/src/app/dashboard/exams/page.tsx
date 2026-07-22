'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Search,
  Clock,
  Sparkles,
  Bot,
  X,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAppSelector } from '@/store';
import { UserRole } from '@ai-lms/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Roles allowed to schedule exams
const CAN_SCHEDULE_EXAMS: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.PRINCIPAL,
  UserRole.MANAGEMENT,
  UserRole.CLASS_TEACHER,
  UserRole.SUBJECT_TEACHER,
];

export default function ExamResultsPage() {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isAiExplainOpen, setIsAiExplainOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form state for AI Explanation
  const [question, setQuestion] = useState('');
  const [studentAns, setStudentAns] = useState('');
  const [correctAns, setCorrectAns] = useState('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Form state for Exam Scheduling
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('UNIT_TEST');
  const [newTotalMarks, setNewTotalMarks] = useState('100');
  const [newPassingMarks, setNewPassingMarks] = useState('40');
  const [newDuration, setNewDuration] = useState('90');
  const [newScheduledAt, setNewScheduledAt] = useState('');

  const canSchedule = user?.role ? CAN_SCHEDULE_EXAMS.includes(user.role) : false;

  // Fetch Exams
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams', search],
    queryFn: async () => {
      const res = await apiClient.get('/exams', {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  // AI Answer Explanation Mutation
  const explainMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/exams/explain-answer', {
        question,
        studentAnswer: studentAns,
        correctAnswer: correctAns,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAiExplanation(data.explanation);
      toast.success('AI Answer Explanation generated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate explanation');
    },
  });

  // Schedule Exam Mutation
  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/exams', {
        title: newTitle,
        type: newType,
        totalMarks: Number(newTotalMarks),
        passingMarks: Number(newPassingMarks),
        duration: Number(newDuration),
        scheduledAt: newScheduledAt || new Date().toISOString(),
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('New exam scheduled successfully!');
      setIsScheduleOpen(false);
      // Reset form
      setNewTitle('');
      setNewScheduledAt('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule exam');
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Exam title is required');
      return;
    }
    scheduleMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-brand-400" /> Examinations & Results
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage exam schedules, mark sheets, grade distribution, and AI answer explanations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Schedule Exam Button (Only visible for Teachers & Admins) */}
          {canSchedule ? (
            <Button
              onClick={() => setIsScheduleOpen(true)}
              variant="glow"
              className="gap-2 shadow-lg glow-brand"
            >
              <PlusCircle className="w-4 h-4" /> Schedule New Exam
            </Button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-muted-foreground text-xs flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-DEFAULT" /> Exams scheduled by Faculty
            </div>
          )}

          <Button
            onClick={() => {
              setAiExplanation(null);
              setIsAiExplainOpen(true);
            }}
            variant="outline"
            className="gap-2 border-ai/50 text-ai-light hover:bg-ai/10 glow-ai"
          >
            <Bot className="w-4 h-4 text-ai" /> AI Answer Explainer
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search exam titles..."
          className="pl-9 bg-white/[0.04] border-white/10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Exam Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 skeleton rounded-3xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <Card className="glass-card border-dashed border-2 border-white/10 p-12 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-foreground">No Exams Scheduled Yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {canSchedule
                ? 'As a Faculty Member or Administrator, you can schedule unit tests, term exams, or lab evaluations for your classes using the button above.'
                : 'Your subject teachers and institution management have not scheduled any upcoming examinations yet.'}
            </p>

            {canSchedule && (
              <Button
                onClick={() => setIsScheduleOpen(true)}
                variant="glow"
                className="gap-2 mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Schedule First Exam Now
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => (
            <Card
              key={exam.id}
              className="glass-card border border-white/10 hover-lift group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-ai/15 text-ai-light border border-ai/30 uppercase tracking-wider">
                    {exam.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-amber-DEFAULT" /> {exam.duration} mins
                  </div>
                </div>

                <CardTitle className="text-lg font-bold mt-2 group-hover:text-brand-300 transition-colors">
                  {exam.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Passing Marks: <span className="font-bold text-foreground">{exam.passingMarks}</span> / {exam.totalMarks}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between items-center pt-2.5 border-t border-white/10">
                  <span>Scheduled Date:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-DEFAULT" />
                    {new Date(exam.scheduledAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Grades Submitted:</span>
                  <span className="font-bold text-emerald-light flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-DEFAULT" />
                    {exam.results?.length ?? 0} students
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Schedule Exam Modal (For Teachers & Admins) ── */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg glass-strong border border-white/20 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Schedule New Examination</CardTitle>
                  <CardDescription className="text-xs">Create test schedule for enrolled students</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Exam Title / Subject</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Unit Test 2: Data Structures & Algorithms"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="bg-white/[0.04] border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-xs font-semibold">Exam Category</Label>
                    <select
                      id="type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="UNIT_TEST" className="bg-card text-foreground">Unit Test</option>
                      <option value="MID_TERM" className="bg-card text-foreground">Mid-Term Exam</option>
                      <option value="FINAL_EXAM" className="bg-card text-foreground">Final Semester Exam</option>
                      <option value="LAB_PRACTICAL" className="bg-card text-foreground">Lab Practical</option>
                      <option value="QUIZ" className="bg-card text-foreground">Surprise Quiz</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="duration" className="text-xs font-semibold">Duration (Minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="90"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="bg-white/[0.04] border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="totalMarks" className="text-xs font-semibold">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      placeholder="100"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(e.target.value)}
                      className="bg-white/[0.04] border-white/10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="passingMarks" className="text-xs font-semibold">Passing Marks</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      placeholder="40"
                      value={newPassingMarks}
                      onChange={(e) => setNewPassingMarks(e.target.value)}
                      className="bg-white/[0.04] border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="scheduledAt" className="text-xs font-semibold">Scheduled Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={newScheduledAt}
                    onChange={(e) => setNewScheduledAt(e.target.value)}
                    className="bg-white/[0.04] border-white/10 text-foreground"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsScheduleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    disabled={scheduleMutation.isPending}
                    className="gap-2"
                  >
                    {scheduleMutation.isPending ? 'Scheduling...' : 'Confirm & Schedule Exam'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Answer Explainer Modal */}
      {isAiExplainOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl glass-strong border border-ai/40 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ai/20 flex items-center justify-center text-ai-light border border-ai/40 glow-ai">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">AI Answer Explainer</CardTitle>
                  <CardDescription className="text-xs">Get instant AI breakdowns for wrong student answers</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsAiExplainOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="question" className="text-xs font-semibold">Exam Question</Label>
                <Input
                  id="question"
                  placeholder="e.g. What is the worst-case time complexity of QuickSort?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="bg-white/[0.04] border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="studentAns" className="text-xs font-semibold">Student's Answer</Label>
                  <Input
                    id="studentAns"
                    placeholder="e.g. O(N log N)"
                    value={studentAns}
                    onChange={(e) => setStudentAns(e.target.value)}
                    className="bg-white/[0.04] border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="correctAns" className="text-xs font-semibold">Correct Model Answer</Label>
                  <Input
                    id="correctAns"
                    placeholder="e.g. O(N^2)"
                    value={correctAns}
                    onChange={(e) => setCorrectAns(e.target.value)}
                    className="bg-white/[0.04] border-white/10"
                  />
                </div>
              </div>

              <Button
                onClick={() => explainMutation.mutate()}
                disabled={explainMutation.isPending || !question || !studentAns || !correctAns}
                variant="ai"
                className="w-full text-white font-bold gap-2 mt-2"
              >
                <Bot className="w-4 h-4" />
                {explainMutation.isPending ? 'Analyzing Answer with AI...' : 'Generate AI Explanation'}
              </Button>

              {aiExplanation && (
                <div className="p-4 rounded-2xl border border-ai/30 bg-ai/5 space-y-2 text-xs mt-4">
                  <div className="font-bold text-ai-light flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-ai" /> AI Feedback & Concept Explanation:
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-foreground/90 bg-black/40 p-4 rounded-xl border border-white/10 text-xs leading-relaxed max-h-64 overflow-y-auto">
                    {aiExplanation}
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
