import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1E8',
        ink: '#141414',
        npcgray: {
          DEFAULT: '#9A9A9A',
          light: '#C9C9C1',
          dark: '#5C5C58',
        },
        errorred: '#E4322E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Archivo Black', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0.05' },
          '50%': { opacity: '1' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        caret: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 0.7s ease-in-out 2',
        glitch: 'glitch 0.25s steps(2, end) 3',
        scan: 'scan 8s linear infinite',
        marquee: 'marquee 30s linear infinite',
        caret: 'caret 1s step-end infinite',
      },
    },
  },
  plugins: [],
};

export default config;
