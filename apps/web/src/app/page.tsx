import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI-LMS — Intelligent Education Platform',
  description: 'The AI-native Education ERP combining LMS, SIS, and intelligent AI tutoring.',
};

const FEATURES = [
  { icon: '🎓', label: 'LMS',         desc: 'Courses, Lessons, Assignments',  color: 'from-brand-500/20 to-brand-600/5',  glow: 'hover:shadow-[0_0_30px_hsl(246,76%,55%,0.25)]', border: 'hover:border-brand-500/40' },
  { icon: '🤖', label: 'AI Tutor',    desc: 'RAG-powered AI assistance',       color: 'from-ai/20 to-ai-dark/5',           glow: 'hover:shadow-[0_0_30px_hsl(275,100%,62%,0.25)]', border: 'hover:border-ai/40' },
  { icon: '📊', label: 'Analytics',   desc: 'Real-time dashboards',            color: 'from-cyan-DEFAULT/20 to-cyan-dark/5', glow: 'hover:shadow-[0_0_30px_hsl(190,100%,52%,0.25)]', border: 'hover:border-cyan-DEFAULT/40' },
  { icon: '👨‍👩‍👧', label: '11 Roles',  desc: 'Full RBAC system',              color: 'from-amber-DEFAULT/20 to-amber-dark/5', glow: 'hover:shadow-[0_0_30px_hsl(38,100%,54%,0.25)]', border: 'hover:border-amber-DEFAULT/40' },
  { icon: '🏫', label: 'ERP',         desc: 'Fee, Library, Placement',         color: 'from-emerald-DEFAULT/20 to-emerald-dark/5', glow: 'hover:shadow-[0_0_30px_hsl(152,76%,42%,0.25)]', border: 'hover:border-emerald-DEFAULT/40' },
  { icon: '🔒', label: 'Secure',      desc: 'JWT + RBAC + OAuth',             color: 'from-brand-500/20 to-ai/5',         glow: 'hover:shadow-[0_0_30px_hsl(246,76%,55%,0.25)]', border: 'hover:border-brand-500/40' },
  { icon: '⚡', label: 'Fast',        desc: 'Redis caching, optimized',        color: 'from-amber-DEFAULT/20 to-cyan-DEFAULT/5', glow: 'hover:shadow-[0_0_30px_hsl(38,100%,54%,0.25)]', border: 'hover:border-amber-DEFAULT/40' },
  { icon: '🚀', label: 'Deployable',  desc: 'Docker + CI/CD ready',            color: 'from-ai/20 to-brand-500/5',         glow: 'hover:shadow-[0_0_30px_hsl(275,100%,62%,0.25)]', border: 'hover:border-ai/40' },
];

const STATS = [
  { value: '11',    label: 'User Roles',      suffix: '+' },
  { value: '99.4',  label: 'AI Satisfaction', suffix: '%' },
  { value: '14k',   label: 'AI Tutor Queries',suffix: '' },
  { value: '42',    label: 'Active Courses',  suffix: '' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cosmic text-foreground overflow-x-hidden">

      {/* ── Ambient background orbs (depth psychology — creates spatial warmth) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb orb-brand absolute w-[600px] h-[600px] top-[-100px] left-[-100px] opacity-70"
             style={{ animationDelay: '0s' }} />
        <div className="orb orb-ai absolute w-[500px] h-[500px] bottom-[10%] right-[-80px] opacity-60"
             style={{ animationDelay: '3s' }} />
        <div className="orb orb-amber absolute w-[300px] h-[300px] top-[40%] left-[60%] opacity-40"
             style={{ animationDelay: '6s' }} />
        <div className="orb orb-cyan absolute w-[250px] h-[250px] top-[20%] right-[30%] opacity-30"
             style={{ animationDelay: '9s' }} />
        {/* Decorative grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/[0.06] glass-dark">
        <Link href="/" className="flex items-center gap-3 group" id="home-logo">
          {/* Logo with animated inner ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.699-1.442 2.699H4.24c-1.47 0-2.441-1.7-1.44-2.7L4.5 14.8" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-black gradient-text tracking-tight">AI-LMS</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/auth/login" id="nav-signin"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-xl hover:bg-white/5">
            Sign In
          </Link>
          <Link href="/auth/register" id="nav-get-started"
            className="relative overflow-hidden px-5 py-2.5 text-sm font-semibold bg-gradient-brand rounded-xl text-white hover:opacity-90 transition-all duration-300 hover:scale-105 glow-brand shadow-lg shadow-brand-500/25 animate-glow-pulse">
            <span className="relative z-10">Get Started →</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] px-6 text-center pt-8 pb-16">

        {/* Status badge — social proof (psychological authority) */}
        <div className="animate-fade-in stagger-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full
            border border-brand-500/30 bg-brand-500/8 text-brand-400 text-sm font-medium mb-10
            hover:border-brand-500/50 hover:bg-brand-500/12 transition-all duration-300 cursor-default" id="hero-badge">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
          </span>
          AI-Powered Education ERP — Now Live
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">BETA</span>
        </div>

        {/* H1 — Typographic hierarchy (F-pattern reading psychology) */}
        <h1 className="animate-fade-in stagger-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight max-w-5xl" id="hero-heading">
          The Future of
          <br />
          <span className="text-shimmer-animated">Education</span>
          <br />
          <span className="text-foreground/90">is Intelligent</span>
        </h1>

        <p className="animate-fade-in stagger-3 text-base md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed font-light">
          An AI-native Education ERP combining Learning Management, Student Information System,
          <span className="text-foreground font-medium"> AI Tutoring</span>, Analytics, and more —
          built for the next generation of institutions.
        </p>

        {/* CTAs — Primary/Secondary split (psychological contrast) */}
        <div className="animate-fade-in stagger-4 flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/auth/login" id="hero-cta-primary"
            className="group relative overflow-hidden px-8 py-4 text-base font-bold bg-gradient-brand rounded-2xl text-white
                       hover:scale-105 transition-all duration-300 glow-brand shadow-2xl shadow-brand-500/30 animate-glow-pulse">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Launch Platform
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
          <Link href="#features" id="hero-cta-secondary"
            className="group px-8 py-4 text-base font-semibold border border-border/60 rounded-2xl text-foreground/80
                       hover:text-foreground hover:border-border hover:bg-white/5 backdrop-blur-sm transition-all duration-300">
            <span className="flex items-center gap-2">
              Explore Features
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Stats bar — Social proof numbers (authority + scarcity psychology) */}
        <div className="animate-fade-in stagger-5 grid grid-cols-2 md:grid-cols-4 gap-px mb-20 w-full max-w-2xl glass rounded-2xl overflow-hidden border border-white/[0.07]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center py-5 px-4 hover:bg-white/[0.04] transition-colors duration-200">
              <span className="text-2xl md:text-3xl font-black gradient-text tabular-nums">
                {s.value}<span className="text-lg">{s.suffix}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium mt-1 text-center">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div id="features" className="w-full max-w-5xl">
          <h2 className="animate-fade-in text-sm font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-8">
            Everything your institution needs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.label}
                className={`animate-fade-in stagger-${Math.min(i + 1, 6)} group relative glass-card rounded-2xl p-5 text-left
                           border border-white/[0.07] transition-all duration-300 cursor-default
                           hover-lift ${f.glow} ${f.border}`}>
                {/* Gradient accent top */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</div>
                  <div className="font-bold text-sm text-foreground mb-1">{f.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6 text-center text-xs text-muted-foreground glass-dark">
        <p>© 2026 AI-LMS · Built with intelligence, designed for education.</p>
      </footer>
    </main>
  );
}
