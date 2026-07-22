'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@ai-lms/shared';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleSidebar } from '@/store/slices/ui.slice';
import { cn, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Banknote,
  Library,
  Briefcase,
  Bot,
  Bell,
  Settings,
  ChevronLeft,
  Sparkles,
  School,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
  aiTag?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Institutions & Schools',
    href: '/dashboard/schools',
    icon: School,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Students (SIS)',
    href: '/dashboard/students',
    icon: GraduationCap,
    roles: [UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER],
  },
  {
    title: 'Faculty & Staff',
    href: '/dashboard/staff',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT],
  },
  {
    title: 'Courses & Lessons',
    href: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    title: 'AI Learning Tutor',
    href: '/dashboard/ai-tutor',
    icon: Bot,
    aiTag: true,
  },
  {
    title: 'Attendance',
    href: '/dashboard/attendance',
    icon: CalendarCheck,
  },
  {
    title: 'Exams & Results',
    href: '/dashboard/exams',
    icon: FileSpreadsheet,
  },
  {
    title: 'Fee Accounts',
    href: '/dashboard/accounts',
    icon: Banknote,
    roles: [UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTS, UserRole.STUDENT, UserRole.PARENT],
  },
  {
    title: 'Library System',
    href: '/dashboard/library',
    icon: Library,
  },
  {
    title: 'Placement Portal',
    href: '/dashboard/placement',
    icon: Briefcase,
    roles: [UserRole.SUPER_ADMIN, UserRole.PLACEMENT_OFFICER, UserRole.STUDENT],
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const userRole = user?.role ?? UserRole.STUDENT;

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card/75 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 flex flex-col shadow-2xl',
        sidebarOpen ? 'w-72' : 'w-20',
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3.5 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-black text-xl gradient-text tracking-tight whitespace-nowrap">
              AI-LMS
            </span>
          )}
        </Link>

        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          title="Toggle Navigation"
        >
          <ChevronLeft className={cn('w-4.5 h-4.5 transition-transform duration-300', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      {/* User Mini Profile */}
      {user && sidebarOpen && (
        <div className="p-4 border border-white/10 bg-white/[0.04] mx-4 my-3 rounded-2xl backdrop-blur-md">
          <p className="font-black text-sm text-foreground truncate">
            {user.firstName} {user.lastName}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider', ROLE_COLORS[user.role])}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-1.5 scrollbar-thin">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-brand text-white shadow-lg shadow-brand-500/25 glow-brand'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.07]',
                !sidebarOpen && 'justify-center px-0',
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />

              {sidebarOpen && (
                <span className="truncate flex-1 text-sm font-bold">{item.title}</span>
              )}

              {sidebarOpen && item.aiTag && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-ai/20 text-ai-light border border-ai/40 glow-ai uppercase">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
