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
          pink: '#ff2d7a',
          blue: '#38bdf8',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          success: '#2ee6b8',
        },
      },
      boxShadow: {
        'neon-pink': '0 10px 30px rgba(255,45,122,.28)',
        'neon-violet': '0 10px 30px rgba(139,92,246,.28)',
      },
    },
  },
  plugins: [],
};
