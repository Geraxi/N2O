import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // 40+ users: bump body to 17px minimum
        base: ['17px', { lineHeight: '1.5' }],
      },
      colors: {
        // High-contrast, status-aware palette
        ink: '#0F172A',
        muted: '#475569',
        line: '#E2E8F0',
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        brand: { DEFAULT: '#1D4ED8', hover: '#1E40AF' },
        ok: '#15803D',
        warn: '#C2410C',
        danger: '#B91C1C',
        info: '#0369A1',
      },
      borderRadius: { lg: '0.5rem', md: '0.375rem', sm: '0.25rem' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
