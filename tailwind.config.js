/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'fira': ['"Fira Code"', 'monospace'],
        'jetbrains': ['"JetBrains Mono"', 'monospace'],
        'orbitron': ['"Orbitron"', 'sans-serif'],
        'exo': ['"Exo 2"', 'sans-serif'],
        'zen': ['"Zen Kaku Gothic New"', 'sans-serif'],
        'noto': ['"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        'terminal-bg': '#0a0a0a',
        'terminal-accent': '#00ff41',
        'terminal-secondary': '#ffd700',
        'cyber-bg': '#0a0e27',
        'cyber-pink': '#ff006e',
        'cyber-cyan': '#00f5d4',
        'zen-bg': '#f8f4ef',
        'zen-dark': '#2d2d2d',
        'zen-red': '#bf3b3b',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
