'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCredentials, clearCredentials } from '@/store/slices/auth.slice';
import { apiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        const user = res.data.data;
        dispatch(setCredentials({ user, accessToken: '' }));
      } catch {
        dispatch(clearCredentials());
        router.push('/auth/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    if (!isAuthenticated) {
      initAuth();
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, dispatch, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand animate-pulse flex items-center justify-center shadow-lg shadow-brand-500/30">
          <span className="text-white font-black text-lg">AI</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading AI-LMS Security Context...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'flex-1 pt-20 px-3 sm:px-6 pb-12 transition-all duration-300 min-h-screen w-full max-w-full overflow-x-hidden',
          sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-20',
        )}
      >
        {children}
      </main>
    </div>
  );
}
