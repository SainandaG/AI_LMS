'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  X,
  Building,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountsPage() {
  const [isAiReminderOpen, setIsAiReminderOpen] = useState(false);
  const [aiReminder, setAiReminder] = useState<string | null>(null);

  // Form states for AI Reminder
  const [remStudentName, setRemStudentName] = useState('');
  const [remAmount, setRemAmount] = useState('5000');
  const [remDueDate, setRemDueDate] = useState('');

  // Fetch Fee Structures
  const { data: structures = [], isLoading: loadingStructures } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const res = await apiClient.get('/accounts/fee-structures');
      return res.data.data;
    },
  });

  // Fetch Enrolled Students for Dropdown
  const { data: students = [] } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data.data;
    },
  });

  // AI Reminder Mutation
  const reminderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/accounts/ai/reminder', {
        studentName: remStudentName,
        amount: Number(remAmount),
        dueDate: remDueDate,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAiReminder(data.reminder);
      toast.success('AI Fee Reminder email generated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate reminder');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-brand-400" /> Accounts & Fee Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage fee structures, student invoices, payment receipts, and automated AI fee reminders
          </p>
        </div>

        <Button
          onClick={() => {
            setAiReminder(null);
            setIsAiReminderOpen(true);
          }}
          variant="outline"
          className="gap-2 border-ai/50 text-ai hover:bg-ai/10"
        >
          <Bot className="w-4 h-4 text-ai" /> AI Reminder Generator
        </Button>
      </div>

      {/* Finance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Billed Invoices</p>
              <p className="text-2xl font-black">{formatCurrency(185000)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-green-500/20 text-green-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-400">Fee Collected</p>
              <p className="text-2xl font-black text-green-400">{formatCurrency(142000)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/20 text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-400">Outstanding Pending</p>
              <p className="text-2xl font-black text-red-400">{formatCurrency(43000)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structures Catalog */}
      <div>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-brand-400" /> Active Fee Structures
        </h2>

        {loadingStructures ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 skeleton rounded-xl" />
            ))}
          </div>
        ) : structures.length === 0 ? (
          <Card className="border-dashed border p-6 text-center text-xs text-muted-foreground">
            No fee structures defined yet. Standard tuition and activity fees will appear here.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {structures.map((fs: any) => (
              <Card key={fs.id} className="border-border/60">
                <CardHeader className="p-4 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 w-fit">
                    {fs.type}
                  </span>
                  <CardTitle className="text-sm font-bold mt-1">{fs.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-lg font-black text-foreground">{formatCurrency(Number(fs.amount))}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Fee Reminder Modal */}
      {isAiReminderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl border-ai/50 relative animate-fade-in my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ai/20 flex items-center justify-center text-ai border border-ai/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">AI Fee Reminder Generator</CardTitle>
                  <CardDescription>Compose professional email/SMS fee reminders</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsAiReminderOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remStudentSelect">Select Enrolled Student</Label>
                <select
                  id="remStudentSelect"
                  value={remStudentName}
                  onChange={(e) => setRemStudentName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="" className="bg-card text-muted-foreground">-- Select Student from Database --</option>
                  {students.map((st: any) => {
                    const fullName = `${st.user?.firstName || ''} ${st.user?.lastName || ''}`.trim() || st.rollNumber;
                    return (
                      <option key={st.id} value={fullName} className="bg-card text-foreground">
                        {fullName} ({st.rollNumber})
                      </option>
                    );
                  })}
                </select>

                <Input
                  id="remStudentName"
                  placeholder="Or type student name manually..."
                  value={remStudentName}
                  onChange={(e) => setRemStudentName(e.target.value)}
                  className="bg-white/[0.04] border-white/10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remAmount">Pending Amount (₹)</Label>
                  <Input
                    id="remAmount"
                    type="number"
                    value={remAmount}
                    onChange={(e) => setRemAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remDueDate">Due Date</Label>
                  <Input
                    id="remDueDate"
                    type="date"
                    value={remDueDate}
                    onChange={(e) => setRemDueDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={() => reminderMutation.mutate()}
                disabled={reminderMutation.isPending || !remStudentName || !remDueDate}
                className="w-full bg-ai hover:bg-ai/90 text-white font-semibold gap-2 mt-2 shadow-lg shadow-ai/20"
              >
                <Bot className="w-4 h-4" />
                {reminderMutation.isPending ? 'Composing Message...' : 'Generate AI Reminder Email'}
              </Button>

              {aiReminder && (
                <div className="p-4 rounded-xl border border-ai/30 bg-ai/5 space-y-2 text-xs mt-4">
                  <div className="font-bold text-ai flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Generated Email Template:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(aiReminder);
                        toast.success('Reminder copied!');
                      }}
                      className="text-xs gap-1"
                    >
                      Copy Email
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-foreground/90 bg-background/50 p-4 rounded-lg border border-border/60 text-xs leading-relaxed max-h-64 overflow-y-auto">
                    {aiReminder}
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
