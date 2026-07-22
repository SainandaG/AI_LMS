'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, ForgotPasswordInput } from '@ai-lms/shared';
import toast from 'react-hot-toast';
import { Mail, KeyRound, Lock, Sparkles, ArrowLeft } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onRequestOtp = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSavedEmail(data.email);
      setStep('reset');
      toast.success('Password reset code sent to your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: savedEmail,
        otp,
        password: newPassword,
      });
      toast.success('Password reset successfully! Please sign in.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-ai/15 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="mb-6 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-black gradient-text tracking-tight">AI-LMS</span>
      </Link>

      <Card className="w-full max-w-md border-border/80 backdrop-blur-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Reset Your Password</CardTitle>
          <CardDescription>
            {step === 'request'
              ? 'Enter your registered email address to receive a 6-digit OTP code'
              : `Enter the 6-digit OTP sent to ${savedEmail}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'request' ? (
            <form onSubmit={handleSubmit(onRequestOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@institution.edu"
                    className="pl-10"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Reset Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="pl-10 tracking-[0.5em] font-mono text-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimum 8 characters"
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? 'Resetting...' : 'Update Password'}
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-muted-foreground pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
