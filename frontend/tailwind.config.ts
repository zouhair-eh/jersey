import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Jersey Store Brand Palette ───────────────────────────────────────
      colors: {
        // Jersey Store
        'bg-primary':   '#0A0A0F',
        'bg-secondary': '#12121A',
        'bg-card':      '#1A1A26',
        'accent-green': '#00FF87',
        'accent-red':   '#FF3D3D',
        'accent-gold':  '#C8A84B',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B0',
        'wa-green':     '#25D366',
        // Legacy brand
        brand: {
          indigo:  '#6366f1',
          purple:  '#a855f7',
          pink:    '#ec4899',
          dark:    '#0A0A0F',
          surface: '#12121A',
          card:    '#1A1A26',
          border:  'rgba(255,255,255,0.08)',
        },
      },
      // ── Font families ─────────────────────────────────────────────────────
      fontFamily: {
        headline: ["'Bebas Neue'", 'sans-serif'],
        sans:     ["'Inter'", 'system-ui', 'sans-serif'],
        inter:    ["'Inter'", 'system-ui', 'sans-serif'],
        arabic:   ["'Cairo'", 'system-ui', 'sans-serif'],
      },
      // ── Backdrop blur ─────────────────────────────────────────────────────
      backdropBlur: {
        glass: '20px',
        xs:    '4px',
      },
      // ── Box shadows (glow effects) ────────────────────────────────────────
      boxShadow: {
        'glow-green':    '0 0 20px rgba(0,255,135,0.35)',
        'glow-green-lg': '0 0 40px rgba(0,255,135,0.45)',
        'glow-red':      '0 0 15px rgba(255,61,61,0.4)',
        'glow-gold':     '0 0 15px rgba(200,168,75,0.4)',
        'glow-wa':       '0 0 28px rgba(37,211,102,0.5)',
        'card-hover':    '0 0 20px rgba(0,255,135,0.3)',
      },
      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        scrollX: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        badgePulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease both',
        shimmer:       'shimmer 1.6s linear infinite',
        'scroll-x':    'scrollX 22s linear infinite',
        float:         'float 3s ease-in-out infinite',
        'pulse-ring':  'pulseRing 1.5s ease-out infinite',
        'badge-pulse': 'badgePulse 2s ease-in-out infinite',
      },
      // ── Grid helpers ──────────────────────────────────────────────────────
      gridTemplateColumns: {
        catalog:   'repeat(auto-fill, minmax(280px, 1fr))',
        portfolio: 'repeat(auto-fill, minmax(200px, 1fr))',
      },
    },
  },
  plugins: [],
};

export default config;
