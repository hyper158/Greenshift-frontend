/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d9e2ee',
          200: '#b3c5db',
          300: '#7e98bd',
          400: '#4a6aa0',
          500: '#2c4a85',
          600: '#1d3563',
          700: '#15264a',
          800: '#0f1b38',
          900: '#0a1326',
          950: '#070d1c',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        glow: '0 0 20px rgba(16,185,129,0.15)',
      },
    },
  },
  plugins: [],
};
