import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ReduxProvider } from '@/components/providers/redux-provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI-LMS — Intelligent Education Platform',
    template: '%s | AI-LMS',
  },
  description:
    'An AI-native Education ERP combining Learning Management, Student Information System, and intelligent AI tutoring in one enterprise platform.',
  keywords: ['LMS', 'Education ERP', 'AI Tutor', 'School Management', 'e-Learning'],
  authors: [{ name: 'AI-LMS Team' }],
  creator: 'AI-LMS',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AI-LMS',
    title: 'AI-LMS — Intelligent Education Platform',
    description: 'AI-native Education ERP with integrated LMS and AI tutoring.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-LMS — Intelligent Education Platform',
    description: 'AI-native Education ERP with integrated LMS and AI tutoring.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <QueryProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'glass-dark border border-border text-foreground',
                  duration: 4000,
                }}
              />
            </QueryProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
