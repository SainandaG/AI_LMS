import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import tailwindAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Design system — CSS variable tokens (shadcn/ui compatible)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // ── AI-LMS custom palette ─────────────────────────────────────
        // PRIMARY: Indigo-Violet (trust + intelligence — psychological authority)
        brand: {
          50:  'hsl(246, 100%, 97%)',
          100: 'hsl(246, 95%, 93%)',
          200: 'hsl(246, 90%, 84%)',
          300: 'hsl(246, 85%, 73%)',
          400: 'hsl(246, 80%, 63%)',
          500: 'hsl(246, 76%, 55%)',   // Core brand
          600: 'hsl(246, 72%, 46%)',
          700: 'hsl(246, 68%, 38%)',
          800: 'hsl(246, 64%, 30%)',
          900: 'hsl(246, 60%, 22%)',
        },
        // AI ACCENT: Electric Violet (creativity + futurism)
        ai: {
          DEFAULT: 'hsl(275, 100%, 62%)',
          light:   'hsl(275, 100%, 80%)',
          dark:    'hsl(275, 100%, 42%)',
          muted:   'hsl(275, 60%, 20%)',
        },
        // REWARD: Amber/Gold (dopamine trigger — success, warmth, action)
        amber: {
          DEFAULT: 'hsl(38, 100%, 54%)',
          light:   'hsl(42, 100%, 72%)',
          dark:    'hsl(34, 100%, 40%)',
          muted:   'hsl(38, 80%, 15%)',
        },
        // HIGHLIGHT: Cyan (attention, data, clarity)
        cyan: {
          DEFAULT: 'hsl(190, 100%, 52%)',
          light:   'hsl(190, 100%, 74%)',
          dark:    'hsl(190, 100%, 34%)',
          muted:   'hsl(190, 80%, 12%)',
        },
        // STATUS: Emerald (growth, success)
        emerald: {
          DEFAULT: 'hsl(152, 76%, 42%)',
          light:   'hsl(152, 76%, 68%)',
          dark:    'hsl(152, 76%, 28%)',
          muted:   'hsl(152, 60%, 10%)',
        },
        // SEMANTIC
        success: 'hsl(152, 76%, 42%)',
        warning: 'hsl(38, 100%, 54%)',
        info:    'hsl(190, 100%, 52%)',
      },

      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains)', ...fontFamily.mono],
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      boxShadow: {
        'glow-brand': '0 0 20px hsl(246,76%,55%,0.4), 0 0 60px hsl(246,76%,55%,0.15)',
        'glow-ai':    '0 0 20px hsl(275,100%,62%,0.4), 0 0 60px hsl(275,100%,62%,0.15)',
        'glow-amber': '0 0 20px hsl(38,100%,54%,0.4), 0 0 60px hsl(38,100%,54%,0.15)',
        'glow-cyan':  '0 0 20px hsl(190,100%,52%,0.4), 0 0 60px hsl(190,100%,52%,0.15)',
        'glass':      '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)',
      },

      keyframes: {
        // Accordion
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // Shimmer skeleton
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        // Entrance animations
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Continuous ambient effects
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-18px) rotate(2deg)' },
          '66%':      { transform: 'translateY(-8px) rotate(-1.5deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-28px)' },
        },
        // Aurora gradient animation
        aurora: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        // Glow pulse (dopamine micro-animation on CTAs)
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px hsl(246,76%,55%,0.3), 0 0 40px hsl(246,76%,55%,0.1)' },
          '50%':      { boxShadow: '0 0 30px hsl(246,76%,55%,0.6), 0 0 80px hsl(246,76%,55%,0.25)' },
        },
        'glow-pulse-ai': {
          '0%, 100%': { boxShadow: '0 0 15px hsl(275,100%,62%,0.3)' },
          '50%':      { boxShadow: '0 0 35px hsl(275,100%,62%,0.65), 0 0 80px hsl(275,100%,62%,0.2)' },
        },
        // Magnetic pulse on hover areas
        'magnetic-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.04)' },
        },
        // Spin slow (for decorative elements)
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
        // Orb drift
        'orb-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%':      { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%':      { transform: 'translate(-15px, 30px) scale(0.98)' },
          '75%':      { transform: 'translate(20px, 15px) scale(1.03)' },
        },
        // Gradient text shimmer
        'text-shimmer': {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        // Number counter bounce
        'count-up': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },

      animation: {
        'accordion-down':    'accordion-down 0.2s ease-out',
        'accordion-up':      'accordion-up 0.2s ease-out',
        shimmer:             'shimmer 2s linear infinite',
        'fade-in':           'fade-in 0.4s ease-out',
        'fade-in-up':        'fade-in-up 0.5s ease-out',
        'fade-in-scale':     'fade-in-scale 0.4s ease-out',
        'slide-in-right':    'slide-in-right 0.3s ease-out',
        'slide-in-left':     'slide-in-left 0.3s ease-out',
        float:               'float 7s ease-in-out infinite',
        'float-slow':        'float-slow 10s ease-in-out infinite',
        aurora:              'aurora 8s ease infinite',
        'glow-pulse':        'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-ai':     'glow-pulse-ai 2.5s ease-in-out infinite',
        'magnetic-pulse':    'magnetic-pulse 3s ease-in-out infinite',
        'spin-slow':         'spin-slow 20s linear infinite',
        'spin-reverse':      'spin-reverse 15s linear infinite',
        'orb-drift':         'orb-drift 12s ease-in-out infinite',
        'text-shimmer':      'text-shimmer 3s linear infinite',
        'ping-slow':         'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      backgroundImage: {
        // Gradients
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':   'linear-gradient(135deg, hsl(246,76%,55%), hsl(275,100%,62%))',
        'gradient-brand-h': 'linear-gradient(90deg, hsl(246,76%,55%), hsl(275,100%,62%))',
        'gradient-dark':    'linear-gradient(160deg, hsl(224,71%,4%), hsl(246,40%,7%), hsl(275,40%,6%))',
        'gradient-amber':   'linear-gradient(135deg, hsl(38,100%,54%), hsl(20,100%,60%))',
        'gradient-cyan':    'linear-gradient(135deg, hsl(190,100%,52%), hsl(210,100%,58%))',
        'gradient-emerald': 'linear-gradient(135deg, hsl(152,76%,42%), hsl(170,76%,42%))',
        // Aurora mesh
        'gradient-aurora':  'linear-gradient(270deg, hsl(246,76%,30%), hsl(275,60%,25%), hsl(246,80%,20%), hsl(275,100%,35%))',
        // Glass surface
        'gradient-glass':   'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        // Shimmer
        shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        // Card accent borders
        'gradient-border':  'linear-gradient(135deg, hsl(246,76%,55%), hsl(275,100%,62%), hsl(246,76%,55%))',
        // Noise texture overlay  
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
