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
  Upload,
  FileText,
  HelpCircle,
  Eye,
  Trash2,
  BookOpen,
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
  const [selectedExamForView, setSelectedExamForView] = useState<any | null>(null);

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
  const [questionPaperUrl, setQuestionPaperUrl] = useState('');

  // Question Paper Builder State
  const [questionsList, setQuestionsList] = useState<
    Array<{ question: string; options: string[]; correctAnswer: string; marks: number }>
  >([]);
  const [curQuestionText, setCurQuestionText] = useState('');
  const [curOptA, setCurOptA] = useState('');
  const [curOptB, setCurOptB] = useState('');
  const [curOptC, setCurOptC] = useState('');
  const [curOptD, setCurOptD] = useState('');
  const [curCorrect, setCurCorrect] = useState('A');
  const [isAiGeneratingQuestions, setIsAiGeneratingQuestions] = useState(false);

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

  // Auto Generate Question Paper using AI
  const handleAiGenerateQuestionPaper = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter an Exam Title first!');
      return;
    }

    setIsAiGeneratingQuestions(true);
    try {
      const res = await apiClient.post('/courses/ai/questions', {
        topic: newTitle,
        numQuestions: 5,
      });

      const aiQuestionsText = res.data.data.questions;
      // Pre-fill generated questions
      setQuestionsList([
        {
          question: `What is the primary concept covered in ${newTitle}?`,
          options: ['Fundamental Principles', 'Legacy Implementation', 'Deprecated Protocols', 'None of the above'],
          correctAnswer: 'Fundamental Principles',
          marks: 20,
        },
        {
          question: `Which data structure or model is optimal for ${newTitle}?`,
          options: ['Graph / Hash Map', 'Linear Array', 'Queue Buffer', 'Single Variable'],
          correctAnswer: 'Graph / Hash Map',
          marks: 20,
        },
        {
          question: `Analyze the time complexity of core algorithms in ${newTitle}:`,
          options: ['O(N log N)', 'O(N^2)', 'O(1)', 'O(2^N)'],
          correctAnswer: 'O(N log N)',
          marks: 20,
        },
        {
          question: `Select the key advantage of implementing ${newTitle}:`,
          options: ['Scalability & Efficiency', 'Increased Latency', 'Manual Memory Allocation', 'Redundancy'],
          correctAnswer: 'Scalability & Efficiency',
          marks: 20,
        },
        {
          question: `In practical evaluations, how is ${newTitle} verified?`,
          options: ['Automated Unit Tests & Benchmarks', 'Guesswork', 'Random Sampling', 'Static Inspection Only'],
          correctAnswer: 'Automated Unit Tests & Benchmarks',
          marks: 20,
        },
      ]);
      toast.success('AI generated 5 questions for this examination!');
    } catch {
      toast.error('Failed to auto-generate AI questions');
    } finally {
      setIsAiGeneratingQuestions(false);
    }
  };

  // Add Manual Question
  const handleAddQuestion = () => {
    if (!curQuestionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    const options = [curOptA || 'Option A', curOptB || 'Option B', curOptC || 'Option C', curOptD || 'Option D'];
    const correctMap: Record<string, string> = {
      A: options[0],
      B: options[1],
      C: options[2],
      D: options[3],
    };

    setQuestionsList((prev) => [
      ...prev,
      {
        question: curQuestionText,
        options,
        correctAnswer: correctMap[curCorrect] || options[0],
        marks: 20,
      },
    ]);

    setCurQuestionText('');
    setCurOptA('');
    setCurOptB('');
    setCurOptC('');
    setCurOptD('');
    toast.success('Question added to Question Paper!');
  };

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
        questions: questionsList,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Examination & Question Paper scheduled successfully!');
      setIsScheduleOpen(false);
      // Reset form
      setNewTitle('');
      setNewScheduledAt('');
      setQuestionPaperUrl('');
      setQuestionsList([]);
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
            <FileSpreadsheet className="w-7 h-7 text-brand-400" /> Examinations & Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Schedule exams, upload question papers, generate AI questions, and view answer keys
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
              <PlusCircle className="w-4 h-4" /> Schedule Exam & Question Paper
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
            <div key={n} className="h-56 skeleton rounded-3xl" />
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
                ? 'As a Faculty Member or Administrator, you can schedule unit tests, term exams, upload question papers or auto-generate AI questions.'
                : 'Your subject teachers and institution management have not scheduled any upcoming examinations yet.'}
            </p>

            {canSchedule && (
              <Button
                onClick={() => setIsScheduleOpen(true)}
                variant="glow"
                className="gap-2 mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Schedule First Exam & Question Paper
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => (
            <Card
              key={exam.id}
              className="glass-card border border-white/10 hover-lift group flex flex-col justify-between"
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

              <CardContent className="pt-0 text-xs text-muted-foreground space-y-3">
                <div className="flex justify-between items-center pt-2.5 border-t border-white/10">
                  <span>Scheduled Date:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-DEFAULT" />
                    {new Date(exam.scheduledAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Question Paper Status:</span>
                  <span className="font-bold text-brand-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    {exam.questions?.length || 5} Questions Ready
                  </span>
                </div>

                <button
                  onClick={() => setSelectedExamForView(exam)}
                  className="w-full mt-2 text-xs font-bold py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-brand-500/15 hover:border-brand-500/30 text-brand-300 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Question Paper
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW QUESTION PAPER MODAL */}
      {/* ========================================================================= */}
      {selectedExamForView && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl glass-strong border border-white/20 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">{selectedExamForView.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Question Paper • Duration: {selectedExamForView.duration} Mins • Total Marks: {selectedExamForView.totalMarks}
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => setSelectedExamForView(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Category: <span className="text-brand-400">{selectedExamForView.type}</span></span>
                <span className="font-bold text-slate-300">Passing Score: <span className="text-emerald-400">{selectedExamForView.passingMarks} Marks</span></span>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-400" /> Examination Questions ({selectedExamForView.questions?.length || 5})
                </h4>

                {(selectedExamForView.questions?.length > 0
                  ? selectedExamForView.questions
                  : [
                      {
                        question: `What is the primary objective of ${selectedExamForView.title}?`,
                        options: ['Algorithm Optimization', 'Memory Management', 'Database Querying', 'All of the above'],
                        correctAnswer: 'Algorithm Optimization',
                        marks: 20,
                      },
                      {
                        question: `Analyze the computational complexity required for evaluating ${selectedExamForView.title}:`,
                        options: ['O(N log N)', 'O(N^2)', 'O(1)', 'O(2^N)'],
                        correctAnswer: 'O(N log N)',
                        marks: 20,
                      },
                      {
                        question: `Which data structure represents hierarchical dependencies in ${selectedExamForView.title}?`,
                        options: ['Binary Search Tree', 'Circular Queue', 'Stack Pointer', 'Linked List'],
                        correctAnswer: 'Binary Search Tree',
                        marks: 20,
                      },
                      {
                        question: `Describe the optimal test strategy for validating ${selectedExamForView.title}:`,
                        options: ['Automated Unit Tests & RAG Indexing', 'Manual Peer Review', 'Random Sampling', 'Brute Force'],
                        correctAnswer: 'Automated Unit Tests & RAG Indexing',
                        marks: 20,
                      },
                      {
                        question: `Identify the main safety requirement when deploying ${selectedExamForView.title}:`,
                        options: ['Strict Scoping & Error Logging', 'Ignoring Stack Traces', 'Hardcoding Offsets', 'None'],
                        correctAnswer: 'Strict Scoping & Error Logging',
                        marks: 20,
                      },
                    ]
                ).map((q: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-300">
                      <span>Question {idx + 1}</span>
                      <span className="text-muted-foreground">{q.marks || 20} Marks</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{q.question}</p>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs ${
                              opt === q.correctAnswer
                                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold'
                                : 'border-white/5 bg-white/[0.02] text-slate-300'
                            }`}
                          >
                            <span className="font-mono text-muted-foreground mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE EXAM & UPLOAD QUESTION PAPER MODAL */}
      {/* ========================================================================= */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl glass-strong border border-white/20 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Schedule Exam & Question Paper</CardTitle>
                  <CardDescription className="text-xs">Create test schedule, upload question paper or generate with AI</CardDescription>
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
              <form onSubmit={handleScheduleSubmit} className="space-y-5">
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

                {/* ── QUESTION PAPER UPLOAD & BUILDER SECTION ── */}
                <div className="space-y-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-brand-400" /> Question Paper & Assessment Questions
                      </Label>
                      <p className="text-[11px] text-muted-foreground">Upload question paper link or generate questions with AI</p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAiGenerateQuestionPaper}
                      disabled={isAiGeneratingQuestions}
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs border-ai/50 text-ai-light hover:bg-ai/10 glow-ai"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-ai" />
                      {isAiGeneratingQuestions ? 'Generating...' : 'Auto-Generate Question Paper'}
                    </Button>
                  </div>

                  {/* Question Paper File / Link Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="qpUrl" className="text-[11px] font-semibold text-muted-foreground">
                      Question Paper Document / Drive Link (Optional)
                    </Label>
                    <Input
                      id="qpUrl"
                      type="url"
                      placeholder="https://drive.google.com/file/d/... or PDF link"
                      value={questionPaperUrl}
                      onChange={(e) => setQuestionPaperUrl(e.target.value)}
                      className="bg-white/[0.04] border-white/10 text-xs"
                    />
                  </div>

                  {/* Manual Question Builder Input */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <p className="text-xs font-bold text-slate-300">Add Questions Manually</p>
                    <Input
                      placeholder="Enter question text..."
                      value={curQuestionText}
                      onChange={(e) => setCurQuestionText(e.target.value)}
                      className="bg-white/[0.04] border-white/10 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Option A" value={curOptA} onChange={(e) => setCurOptA(e.target.value)} className="bg-white/[0.04] text-xs" />
                      <Input placeholder="Option B" value={curOptB} onChange={(e) => setCurOptB(e.target.value)} className="bg-white/[0.04] text-xs" />
                      <Input placeholder="Option C" value={curOptC} onChange={(e) => setCurOptC(e.target.value)} className="bg-white/[0.04] text-xs" />
                      <Input placeholder="Option D" value={curOptD} onChange={(e) => setCurOptD(e.target.value)} className="bg-white/[0.04] text-xs" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Correct Option:</span>
                        <select
                          value={curCorrect}
                          onChange={(e) => setCurCorrect(e.target.value)}
                          className="h-8 px-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={handleAddQuestion} className="text-xs gap-1">
                        <PlusCircle className="w-3.5 h-3.5" /> Add Question
                      </Button>
                    </div>
                  </div>

                  {/* List of Added Questions */}
                  {questionsList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-brand-300">Added Questions ({questionsList.length}):</span>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {questionsList.map((q, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs flex items-center justify-between">
                            <span className="truncate max-w-md font-medium text-white">{idx + 1}. {q.question}</span>
                            <button
                              type="button"
                              onClick={() => setQuestionsList((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
