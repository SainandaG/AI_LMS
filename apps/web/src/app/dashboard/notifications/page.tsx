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
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificationsCenterPage() {
  const queryClient = useQueryClient();
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);

  // Fetch Announcements
  const { data: announcements = [], isLoading: loadingAnn } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/announcements');
      return res.data.data;
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
      toast.success(`Announcement '${newAnn.title}' broadcasted!`);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsAnnModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to broadcast announcement');
    },
  });

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" /> Notifications & Broadcasts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Broadcast institution notices, urgent alerts, and view direct system messages
          </p>
        </div>

        <Button onClick={() => setIsAnnModalOpen(true)} className="gap-2">
          <Megaphone className="w-4 h-4" /> Broadcast Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed: Broadcast Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-brand-400 animate-pulse" /> Institution Announcements
          </h2>

          {loadingAnn ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 skeleton rounded-2xl" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <Card className="border-dashed border p-8 text-center text-xs text-muted-foreground">
              No active announcements. Click "Broadcast Announcement" to issue a school notice.
            </Card>
          ) : (
            announcements.map((ann: any) => (
              <Card key={ann.id} className="border-border/60 hover:border-brand-500/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      BROADCAST
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold mt-2">{ann.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground leading-relaxed">
                  <p>{ann.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Personal Inbox */}
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" /> Direct Inbox
          </h2>

          {loadingNotes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 skeleton rounded-xl" />
              ))}
            </div>
          ) : personalNotes.length === 0 ? (
            <Card className="border-dashed border p-6 text-center text-xs text-muted-foreground">
              Your direct inbox is clear!
            </Card>
          ) : (
            personalNotes.map((note: any) => (
              <div
                key={note.id}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-1 ${
                  note.isRead
                    ? 'border-border/40 bg-accent/20 opacity-70'
                    : 'border-brand-500/40 bg-brand-500/5 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{note.title}</span>
                  {!note.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(note.id)}
                      className="text-[10px] text-brand-400 hover:underline"
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

      {/* Broadcast Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border relative animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-brand-400" /> Broadcast Announcement
                </CardTitle>
                <CardDescription>Publish a notice visible to students, teachers & parents</CardDescription>
              </div>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit((d) => createAnnMutation.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Notice Title</Label>
                  <Input id="title" placeholder="e.g. Campus Holiday Notice for Independence Day" required {...register('title')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Announcement Details</Label>
                  <textarea
                    id="content"
                    rows={4}
                    placeholder="Provide full details of the broadcast notice..."
                    className="w-full rounded-lg border border-border/80 bg-background/50 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    {...register('content')}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsAnnModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAnnMutation.isPending}>
                    {createAnnMutation.isPending ? 'Publishing...' : 'Broadcast Notice'}
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
