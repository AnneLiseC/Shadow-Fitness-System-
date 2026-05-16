import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        violet: {
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
          light: '#a855f7',
        },
        cyan: {
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        },
        gold: '#f59e0b',
        danger: '#dc2626',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'Orbitron', 'monospace'],
        rajdhani: ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        scanline: 'scanline 4s linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(124,58,237,0.4)' },
          '50%': { boxShadow: '0 0 15px rgba(124,58,237,0.8), 0 0 30px rgba(6,182,212,0.3)' },
        },
        scanline: {
          '0%': { top: '-100%' },
          '100%': { top: '200%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
