/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          base: '#0a0a0f',
          surface: '#111118',
          elevated: '#0f0f1a',
          panel: '#12121c',
          ink: '#14141c',
          pink: '#ec4899',
          'pink-hover': '#db2777',
          violet: '#a855f7',
          cyan: '#22d3ee',
          sky: '#38bdf8',
          mint: '#2ee6b8',
        },
      },
      boxShadow: {
        'neon-line': 'inset 0 -1px 0 0 rgba(168, 85, 247, 0.12)',
        'neon-sm': '0 0 0 1px rgba(168, 85, 247, 0.12), 0 4px 24px rgba(0, 0, 0, 0.4)',
        'neon-pink': '0 8px 28px rgba(236, 72, 153, 0.22)',
        'neon-violet': '0 8px 28px rgba(168, 85, 247, 0.2)',
        'neon-cyan': '0 8px 28px rgba(34, 211, 238, 0.18)',
        'card-hover':
          '0 14px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(168, 85, 247, 0.1)',
      },
      transitionDuration: {
        180: '180ms',
        220: '220ms',
      },
    },
  },
  plugins: [],
};
