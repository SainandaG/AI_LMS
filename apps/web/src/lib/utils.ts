import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes (standard Shadcn pattern)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

// Format currency (Indian Rupee by default)
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// Get user initials for avatar fallback
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Sleep utility for development
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Extract API error message
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message ?? 'An unexpected error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

// Role display names
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  PRINCIPAL: 'Principal',
  MANAGEMENT: 'Management',
  ACCOUNTS: 'Accounts',
  CLASS_TEACHER: 'Class Teacher',
  SUBJECT_TEACHER: 'Subject Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  LIBRARIAN: 'Librarian',
  PLACEMENT_OFFICER: 'Placement Officer',
  HOSTEL_WARDEN: 'Hostel Warden',
};

// Role colors for badges
export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  PRINCIPAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  MANAGEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  STUDENT: 'bg-green-500/20 text-green-400 border-green-500/30',
  SUBJECT_TEACHER: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CLASS_TEACHER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  PARENT: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  LIBRARIAN: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  ACCOUNTS: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  PLACEMENT_OFFICER: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  HOSTEL_WARDEN: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};
