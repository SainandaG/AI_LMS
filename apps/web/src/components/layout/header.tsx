'use client';

import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCredentials } from '@/store/slices/auth.slice';
import { setAccessToken, apiClient } from '@/lib/api-client';
import { getInitials, ROLE_LABELS, ROLE_COLORS, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Sun, Moon, LogOut, Search, Bell, Sparkles, Menu } from 'lucide-react';
import { toggleSidebar } from '@/store/slices/ui.slice';
import Link from 'next/link';

export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      dispatch(clearCredentials());
      toast.success('Logged out successfully');
      router.push('/auth/login');
    }
  };

  return (
    <header
      className={cn(
        'h-16 fixed top-0 right-0 z-30 border-b border-white/10 bg-card/60 backdrop-blur-2xl transition-all duration-300 flex items-center justify-between px-4 sm:px-6 shadow-sm left-0',
        sidebarOpen ? 'lg:left-72' : 'lg:left-20',
      )}
    >
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-2 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors mr-3 lg:hidden"
        title="Open Navigation Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Input */}
      <div className="relative w-72 hidden sm:block">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses, students, lessons..."
          className="w-full h-9 pl-9 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Quick AI Tutor Pill */}
        <Link
          href="/dashboard/ai-tutor"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ai/10 border border-ai/30 text-ai-light hover:bg-ai/20 text-xs font-bold transition-all duration-200 glow-ai"
        >
          <Sparkles className="w-3.5 h-3.5 text-ai animate-pulse" />
          <span>AI Tutor</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/notifications"
          className="p-2 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-DEFAULT animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-DEFAULT" />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-DEFAULT" /> : <Moon className="w-4 h-4 text-brand-400" />}
        </button>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand text-white flex items-center justify-center font-black text-xs shadow-md shadow-brand-500/20">
              {getInitials(user.firstName, user.lastName)}
            </div>

            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-foreground leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <span className={cn('text-[9px] font-bold uppercase tracking-wider', ROLE_COLORS[user.role]?.split(' ')[1])}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
