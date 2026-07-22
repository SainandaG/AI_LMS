'use client';

import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, GraduationCap, Users, BookOpen, Bot, TrendingUp, AlertTriangle, ArrowRight, Zap, Award, Activity } from 'lucide-react';
import Link from 'next/link';

export default function GeneralDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const STATS = [
    { label: 'Active Students', value: '1,248', change: '+12% this term', icon: GraduationCap, color: 'text-emerald-light bg-emerald-DEFAULT/10 border-emerald-DEFAULT/20', line: 'accent-line-emerald' },
    { label: 'Faculty Members', value: '86', change: '100% active', icon: Users, color: 'text-ai-light bg-ai/10 border-ai/20', line: 'accent-line-brand' },
    { label: 'Enrolled Courses', value: '42', change: '8 AI-assisted', icon: BookOpen, color: 'text-brand-300 bg-brand-500/10 border-brand-500/20', line: 'accent-line-cyan' },
    { label: 'AI Tutor Queries', value: '14,290', change: '99.4% satisfaction', icon: Bot, color: 'text-amber-light bg-amber-DEFAULT/10 border-amber-DEFAULT/20', line: 'accent-line-amber' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">

      {/* ── Hero Banner with Animated Gradient Mesh & Floating Badge ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 md:p-10 text-white shadow-2xl shadow-brand-500/25 border border-white/10">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-ai/20 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute right-1/3 -top-16 w-60 h-60 bg-amber-DEFAULT/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-light animate-pulse" />
            <span>AI-Powered ERP Engine Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-light animate-ping" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            Welcome back, {user.firstName}!
          </h1>

          <p className="text-white/85 text-sm sm:text-base font-light max-w-xl leading-relaxed">
            Connected to <strong className="font-semibold text-white">Demo Academy</strong>. Logged in as{' '}
            <span className="bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-white">
              {user.role}
            </span>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/ai-tutor"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-xs hover:bg-white/90 transition-all duration-200 shadow-lg hover:scale-105"
            >
              <Bot className="w-4 h-4 text-ai" /> Start AI Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white border border-white/20 font-semibold text-xs transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" /> View Courses
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards with Hover Lift & Color Accents ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`glass-card border border-white/10 hover-lift relative overflow-hidden transition-all duration-300 ${stat.line}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black tracking-tight text-foreground">{stat.value}</div>
                  <div className="text-xs font-medium text-emerald-light mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-DEFAULT" /> {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Feature Highlights Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Tutor Assistant Spotlight */}
        <Card className="lg:col-span-2 glass-card border border-white/10 hover:border-ai/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ai/10 rounded-full blur-3xl pointer-events-none" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-ai/15 text-ai border border-ai/30 glow-ai">
                  <Bot className="w-5 h-5" />
                </div>
                <span>AI Tutor Intelligent Assistant</span>
              </CardTitle>
              <span className="px-2.5 py-1 rounded-full bg-ai/15 text-ai text-[10px] font-bold border border-ai/30 animate-pulse">
                RAG ACTIVE
              </span>
            </div>
            <CardDescription className="text-xs">Ask questions or generate real-time lesson summaries & quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4.5 rounded-2xl border border-ai/20 bg-ai/5 backdrop-blur-md space-y-3">
              <p className="font-semibold text-xs text-ai-light flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ai" /> Recommended contextual actions for your role:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <li className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 hover:border-ai/30 transition-colors cursor-pointer">
                  <Zap className="w-3.5 h-3.5 text-amber-DEFAULT shrink-0" />
                  <span>Practice questions for Grade 11 CS</span>
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 hover:border-ai/30 transition-colors cursor-pointer">
                  <BookOpen className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>Summarize Lesson 4: Data Structures</span>
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 hover:border-ai/30 transition-colors cursor-pointer">
                  <Activity className="w-3.5 h-3.5 text-cyan-DEFAULT shrink-0" />
                  <span>Attendance trend report for Section A</span>
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 hover:border-ai/30 transition-colors cursor-pointer">
                  <Award className="w-3.5 h-3.5 text-emerald-DEFAULT shrink-0" />
                  <span>Generate performance insights</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-1">
              <Link
                href="/dashboard/ai-tutor"
                className="inline-flex items-center gap-2 text-xs font-bold text-ai-light hover:text-white transition-colors bg-ai/20 hover:bg-ai/30 px-4 py-2.5 rounded-xl border border-ai/30 glow-ai"
              >
                Launch AI Chat Interface →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Notices & Alerts */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-DEFAULT/15 text-amber-DEFAULT border border-amber-DEFAULT/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>Live Notices</span>
            </CardTitle>
            <CardDescription className="text-xs">Institution updates & pending actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-DEFAULT/10 border border-amber-DEFAULT/20 text-amber-light text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-DEFAULT" /> Mid-Term Exams Scheduled
              </div>
              <p className="text-[11px] opacity-80 pl-3.5">Grade 11 timetable released for parents & teachers.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-400" /> Fee Reminder Automation
              </div>
              <p className="text-[11px] opacity-80 pl-3.5">14 pending invoices ready for automated notification dispatch.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-DEFAULT/10 border border-emerald-DEFAULT/20 text-emerald-light text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-DEFAULT" /> System Health Optimal
              </div>
              <p className="text-[11px] opacity-80 pl-3.5">All 11 modules synced with main database.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
