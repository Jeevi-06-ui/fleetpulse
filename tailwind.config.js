/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fleet: {
          bg: {
            light: '#F8FAFC',
            dark: '#071525',
          },
          panel: {
            light: '#FFFFFF',
            dark: '#102338',
          },
          border: {
            light: '#E2E8F0',
            dark: '#1E3A5F',
          },
          primary: {
            DEFAULT: '#13C8C1', // Teal / Cyan accent
            hover: '#0ea5a0',
            dark: '#0d9488',
          },
          cobalt: {
            DEFAULT: '#4169E1',
            hover: '#3154b3',
          },
          navy: {
            900: '#071525',
            800: '#0D1E33',
            700: '#102338',
            600: '#1E3A5F',
          },
          status: {
            available: '#10B981',
            assigned: '#3B82F6',
            inTransit: '#13C8C1',
            maintenance: '#F59E0B',
            inactive: '#64748B',
            danger: '#EF4444',
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'fleet': '12px',
      }
    },
  },
  plugins: [],
};
