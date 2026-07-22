'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '@ai-lms/shared';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

import { apiClient, setAccessToken } from '@/lib/api-client';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/auth.slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Demo quick login credentials with color theory accents (Red=Admin/Power, Violet=Principal/Wisdom, Amber=Teacher/Guidance, Green=Student/Growth)
const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'superadmin@ailms.dev', pass: 'SuperAdmin@123', badge: 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' },
  { role: 'Principal', email: 'principal@demoacademy.edu', pass: 'Principal@123', badge: 'bg-ai/10 text-ai-light border-ai/30 hover:bg-ai/20' },
  { role: 'Teacher', email: 'teacher@demoacademy.edu', pass: 'Teacher@123', badge: 'bg-amber-DEFAULT/10 text-amber-light border-amber-DEFAULT/30 hover:bg-amber-DEFAULT/20' },
  { role: 'Student', email: 'student@demoacademy.edu', pass: 'Student@123', badge: 'bg-emerald-DEFAULT/10 text-emerald-light border-emerald-DEFAULT/30 hover:bg-emerald-DEFAULT/20' },
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, tokens } = response.data.data;

      // Store in memory & Redux
      setAccessToken(tokens.accessToken);
      dispatch(setCredentials({ user, accessToken: tokens.accessToken }));

      toast.success(`Welcome back, ${user.firstName}!`);

      // Role-based redirect
      router.push('/dashboard');

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: string, email: string, pass: string) => {
    setActiveAccount(role);
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-cosmic flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* ── Dynamic Ambient Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb orb-brand absolute w-[500px] h-[500px] -top-32 -left-32 opacity-60" />
        <div className="orb orb-ai absolute w-[450px] h-[450px] -bottom-32 -right-32 opacity-50" />
        <div className="orb orb-amber absolute w-[250px] h-[250px] top-1/2 left-1/4 opacity-30" />
      </div>

      {/* Brand Header */}
      <Link href="/" className="mb-8 flex items-center gap-3 group relative z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-300" />
          <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300 relative z-10">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>
        <span className="text-3xl font-black gradient-text tracking-tight">AI-LMS</span>
      </Link>

      <Card className="w-full max-w-md glass-card border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10 animate-fade-in-up">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">
            Sign In to <span className="gradient-text">Portal</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            Access your AI-native ERP portal & intelligent LMS dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Demo Quick-Select */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-DEFAULT" /> Interactive Demo Accounts:
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">1-Click Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.role, acc.email, acc.pass)}
                  className={`text-xs px-3 py-2 rounded-xl border font-medium text-left transition-all duration-200 flex items-center justify-between ${acc.badge} ${activeAccount === acc.role ? 'ring-2 ring-brand-500 scale-[1.02]' : ''}`}
                >
                  <span>{acc.role}</span>
                  {activeAccount === acc.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-DEFAULT" />}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/90">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@institution.edu"
                  className="pl-10 h-11 bg-white/[0.04] border-white/10 focus:border-brand-500/50 rounded-xl"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-white/[0.04] border-white/10 focus:border-brand-500/50 rounded-xl"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold bg-gradient-brand hover:opacity-95 rounded-xl glow-brand transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-1">
            Don't have an account yet?{' '}
            <Link
              href="/auth/register"
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors underline-offset-4 hover:underline"
            >
              Register Here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
