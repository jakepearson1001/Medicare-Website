/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        desk: '#0E1620',
        panel: '#182230',
        panel2: '#1E2A3A',
        edge: '#2A3A4D',
        brass: '#C9A24B',
        accblue: '#5B8FD9',
        accgreen: '#4FAE82',
        accred: '#D9705A',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        win: '10px',
      },
      boxShadow: {
        win: '0 18px 40px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
