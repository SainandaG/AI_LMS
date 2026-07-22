'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Bell,
  Megaphone,
  Calendar,
  X,
  Radio,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificationsCenterPage() {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  // Modal states
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcements' | 'complaints'>('announcements');

  // Form states for Complaints
  const [compSubject, setCompSubject] = useState('');
  const [compCategory, setCompCategory] = useState('ACADEMIC');
  const [compDescription, setCompDescription] = useState('');

  // Fetch Announcements
  const { data: announcements = [], isLoading: loadingAnn } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/announcements');
      return res.data.data;
    },
  });

  // Fetch Complaints / Grievances
  const { data: complaints = [
    {
      id: 'c1',
      ticketNo: 'GRV-9021',
      subject: 'Delay in Semester 2 Practical Lab Schedules',
      category: 'ACADEMIC',
      status: 'IN_REVIEW',
      submittedBy: 'Student Representative (Grade 11)',
      description: 'The physics lab sessions scheduled on Tuesdays overlap with the mid-term revision classes.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c2',
      ticketNo: 'GRV-8834',
      subject: 'Library WiFi connectivity issue in Study Hall 3',
      category: 'INFRASTRUCTURE',
      status: 'RESOLVED',
      submittedBy: 'Parent / Guardian',
      description: 'WiFi disconnects frequently near the east wing tables. Kindly check router access point.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ] } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/notifications/complaints');
        return res.data.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch Personal Notifications
  const { data: personalNotes = [], isLoading: loadingNotes } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications');
      return res.data.data;
    },
  });

  // Broadcast Announcement Mutation
  const { register, handleSubmit, reset } = useForm();
  const createAnnMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiClient.post('/notifications/announcements', formData);
      return res.data.data;
    },
    onSuccess: (newAnn) => {
      toast.success(`Notice '${newAnn.title || 'Announcement'}' broadcasted successfully!`);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsAnnModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to broadcast notice');
    },
  });

  // Submit Complaint Mutation
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compSubject.trim() || !compDescription.trim()) {
      toast.error('Please enter a subject and description');
      return;
    }
    toast.success('Complaint / Grievance ticket submitted to Institution Admin!');
    setIsComplaintModalOpen(false);
    setCompSubject('');
    setCompDescription('');
  };

  // Mark Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-brand-400" /> Broadcasts, Meetings & Grievance Desk
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Target announcements for PTMs, faculty meetings, and raise official complaints to administration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsComplaintModalOpen(true)} variant="outline" className="gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
            <MessageSquarePlus className="w-4 h-4" /> Raise Complaint
          </Button>

          <Button onClick={() => setIsAnnModalOpen(true)} variant="glow" className="gap-2 shadow-lg glow-brand">
            <Megaphone className="w-4 h-4" /> Broadcast Announcement
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-brand-500/15 border border-brand-500/30 text-brand-300'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Radio className="w-4 h-4" /> Announcements & Meetings
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Complaint & Grievance Desk ({complaints.length})
        </button>
      </div>

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-400 animate-pulse" /> Published Notices & Scheduled Meetings
            </h2>

            {loadingAnn ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 skeleton rounded-2xl" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <Card className="glass-card border-dashed border-2 border-white/10 p-8 text-center text-xs text-muted-foreground">
                No active announcements yet. Click "Broadcast Announcement" to send notices to Students, Parents, or Faculty.
              </Card>
            ) : (
              announcements.map((ann: any) => (
                <Card key={ann.id} className="glass-card border border-white/10 hover-lift">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                          {ann.type || 'GENERAL'}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Target: {ann.targetAudience || 'ALL_CAMPUS'}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-DEFAULT" />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold mt-2 text-foreground">{ann.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground leading-relaxed">
                    <p>{ann.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Personal Direct Inbox */}
          <div className="space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-DEFAULT" /> Direct System Notifications
            </h2>

            {loadingNotes ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 skeleton rounded-xl" />
                ))}
              </div>
            ) : personalNotes.length === 0 ? (
              <Card className="glass-card border-dashed border border-white/10 p-6 text-center text-xs text-muted-foreground">
                Your direct inbox is clean!
              </Card>
            ) : (
              personalNotes.map((note: any) => (
                <div
                  key={note.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                    note.isRead
                      ? 'border-white/5 bg-white/[0.02] opacity-70'
                      : 'border-brand-500/40 bg-brand-500/5 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{note.title}</span>
                    {!note.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(note.id)}
                        className="text-[10px] text-brand-300 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-muted-foreground">{note.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* COMPLAINTS & GRIEVANCE TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Active Complaints & Grievance Tickets
            </h2>
            <Button onClick={() => setIsComplaintModalOpen(true)} size="sm" variant="outline" className="gap-1.5 text-xs">
              <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" /> Raise New Complaint
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c: any) => (
              <Card key={c.id} className="glass-card border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{c.ticketNo}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      c.status === 'RESOLVED'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {c.status === 'RESOLVED' ? '✓ RESOLVED' : '⏳ IN REVIEW'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{c.subject}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-brand-400" /> {c.submittedBy}
                  </span>
                  <span>Category: {c.category}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BROADCAST ANNOUNCEMENT MODAL */}
      {/* ========================================================================= */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg glass-strong border border-white/20 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white glow-brand">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Broadcast Notice / Meeting</CardTitle>
                  <CardDescription className="text-xs">Publish announcement with target audience control</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit((d) => createAnnMutation.mutate(d))} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Notice / Meeting Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Parent-Teacher Meeting (PTM) for Term 1 Results"
                    required
                    {...register('title')}
                    className="bg-white/[0.04] border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-xs font-semibold">Notice Type</Label>
                    <select
                      id="type"
                      {...register('type')}
                      className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="GENERAL" className="bg-card text-foreground">General Notice</option>
                      <option value="PTM_MEETING" className="bg-card text-foreground">👨‍👩‍👧 Parent-Teacher Meeting (PTM)</option>
                      <option value="ADMIN_MEETING" className="bg-card text-foreground">🏫 Internal Administrative Meeting</option>
                      <option value="EXAM_NOTICE" className="bg-card text-foreground">📝 Examination Schedule</option>
                      <option value="HOLIDAY" className="bg-card text-foreground">🎉 Campus Holiday</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="targetAudience" className="text-xs font-semibold">Who Can See This?</Label>
                    <select
                      id="targetAudience"
                      {...register('targetAudience')}
                      className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="ALL" className="bg-card text-foreground font-bold">🌐 Everyone (All Students, Parents & Staff)</option>
                      <option value="STUDENTS" className="bg-card text-foreground">🎓 Students Only</option>
                      <option value="PARENTS" className="bg-card text-foreground">👨‍👩‍👧 Parents & Guardians Only</option>
                      <option value="TEACHERS" className="bg-card text-foreground">👨‍🏫 Faculty & Teaching Staff Only</option>
                      <option value="ADMINISTRATORS" className="bg-card text-foreground">🏫 Internal Administration Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-semibold">Announcement Details</Label>
                  <textarea
                    id="content"
                    rows={4}
                    placeholder="Provide full details of the notice, meeting agenda, or venue..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                    {...register('content')}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setIsAnnModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="glow" disabled={createAnnMutation.isPending}>
                    {createAnnMutation.isPending ? 'Publishing...' : 'Broadcast Notice'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RAISE COMPLAINT / GRIEVANCE MODAL */}
      {/* ========================================================================= */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg glass-strong border border-amber-500/30 relative animate-fade-in-up my-8 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/40">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Raise Complaint / Grievance</CardTitle>
                  <CardDescription className="text-xs">Submit issues directly to school administration</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsComplaintModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="compSubject" className="text-xs font-semibold">Complaint Subject</Label>
                  <Input
                    id="compSubject"
                    placeholder="e.g. Overlapping Lab schedule / Transport route issue"
                    value={compSubject}
                    onChange={(e) => setCompSubject(e.target.value)}
                    required
                    className="bg-white/[0.04] border-white/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="compCategory" className="text-xs font-semibold">Grievance Category</Label>
                  <select
                    id="compCategory"
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ACADEMIC" className="bg-card text-foreground">Academics & Examination</option>
                    <option value="INFRASTRUCTURE" className="bg-card text-foreground">Campus Infrastructure & WiFi</option>
                    <option value="FEES_ACCOUNTS" className="bg-card text-foreground">Fees & Accounts Receipts</option>
                    <option value="STAFF_FEEDBACK" className="bg-card text-foreground">Faculty & Staff Feedback</option>
                    <option value="SAFETY_BUS" className="bg-card text-foreground">Bus Transport & Safety</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="compDescription" className="text-xs font-semibold">Detailed Description</Label>
                  <textarea
                    id="compDescription"
                    rows={4}
                    placeholder="Provide exact details of the complaint so administration can address it quickly..."
                    value={compDescription}
                    onChange={(e) => setCompDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setIsComplaintModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2">
                    Submit Grievance Ticket
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
