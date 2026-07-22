'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterInput } from '@ai-lms/shared';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, Phone, Sparkles } from 'lucide-react';

import { apiClient, setAccessToken } from '@/lib/api-client';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/auth.slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/register', data);
      setIsSuccessModalOpen(true);
      toast.success('Registration submitted for administrative approval!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
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

      <Card className="w-full max-w-lg border-border/80 backdrop-blur-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Create Your Account</CardTitle>
          <CardDescription>
            Join the AI-powered education experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    className="pl-10"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="pl-10"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@institution.edu"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+919876543210"
                  className="pl-10"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 chars with Upper, Lower, Number & Symbol"
                  className="pl-10 pr-10"
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
              className="w-full h-11 text-base font-semibold mt-2"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              Sign In Here
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approval Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md glass-strong border border-amber-DEFAULT/40 relative animate-fade-in-up text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-DEFAULT/15 border border-amber-DEFAULT/30 flex items-center justify-center mx-auto text-amber-light glow-amber">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground">Registration Submitted!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your student account has been created successfully. For security reasons, self-registered accounts require administrative approval before you can sign in.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-brand-300">
              ⏳ <span className="font-semibold text-foreground">Status: Pending Verification</span>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your institution principal or class teacher can activate your account from the Student Directory.
              </p>
            </div>

            <Button
              variant="glow"
              onClick={() => router.push('/auth/login')}
              className="w-full font-bold gap-2 mt-2"
            >
              Proceed to Sign In
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
