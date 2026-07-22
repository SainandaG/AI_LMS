'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield, Key, Sparkles, Moon, Sun, Save, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'ai'>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Settings updated successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          System <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account preferences, notification rules, security & AI tutor options.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl glass-dark border border-white/10 w-fit">
        {[
          { id: 'profile', label: 'Profile Preferences', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Auth', icon: Shield },
          { id: 'ai', label: 'AI Tutor Tuning', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
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

      {/* Tab Contents */}
      {activeTab === 'profile' && (
        <Card className="glass-card border border-white/10 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Personal & Account Information</CardTitle>
            <CardDescription className="text-xs">Update your display profile and system configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold">First Name</Label>
                  <Input id="firstName" defaultValue={user?.firstName || ''} className="bg-white/[0.04] border-white/10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold">Last Name</Label>
                  <Input id="lastName" defaultValue={user?.lastName || ''} className="bg-white/[0.04] border-white/10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} disabled className="bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold">Assigned Role</Label>
                <Input id="role" defaultValue={user?.role || 'STUDENT'} disabled className="bg-white/[0.02] border-white/5 opacity-60 uppercase font-mono font-bold text-brand-400 cursor-not-allowed" />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">Appearance Theme</span>
                  <p className="text-[11px] text-muted-foreground">Select preferred interface color scheme</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-DEFAULT" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-brand-400" /> Dark Mode
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="glow" className="flex items-center gap-2">
                  {saved ? <Check className="w-4 h-4 text-emerald-DEFAULT" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Preferences'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="glass-card border border-white/10 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Notification Controls</CardTitle>
            <CardDescription className="text-xs">Configure real-time alerts & email digest dispatches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Email Summaries', desc: 'Receive weekly progress digests & performance analytics', defaultChecked: true },
              { title: 'AI Doubt Resolution Alerts', desc: 'Notify when AI Tutor resolves pending course queries', defaultChecked: true },
              { title: 'Fee Payment Reminders', desc: 'Instant alerts for pending institutional invoices', defaultChecked: true },
              { title: 'Exam Timetable Changes', desc: 'Urgent push alerts for schedule modifications', defaultChecked: false },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={n.defaultChecked}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-brand-500 cursor-pointer"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="glass-card border border-white/10 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Security & Password</CardTitle>
            <CardDescription className="text-xs">Manage authentication credentials and active sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currPass" className="text-xs font-semibold">Current Password</Label>
                <Input id="currPass" type="password" placeholder="••••••••" className="bg-white/[0.04] border-white/10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPass" className="text-xs font-semibold">New Password</Label>
                <Input id="newPass" type="password" placeholder="••••••••" className="bg-white/[0.04] border-white/10" />
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="glow" className="flex items-center gap-2">
                  <Key className="w-4 h-4" /> Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'ai' && (
        <Card className="glass-card border border-white/10 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ai" /> AI Tutor Parameters
            </CardTitle>
            <CardDescription className="text-xs">Customize response depth and AI interaction behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">AI Assistant Tone</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Socratic & Explanatory', 'Concise & Academic', 'Detailed with Code'].map((tone, idx) => (
                  <button
                    key={tone}
                    type="button"
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      idx === 0 ? 'border-ai/40 bg-ai/10 text-ai-light glow-ai' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-ai/5 border border-ai/20 text-xs text-ai-light space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-ai" /> RAG Context Indexing Active
              </span>
              <p className="opacity-80">Vector database automatically fetches institution curriculum guidelines for all AI queries.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
