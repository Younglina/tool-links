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
        // Neumorphism fonts
        'display': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['"DM Sans"', 'sans-serif'],
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
        // Neumorphism colors
        'neu-bg': '#E0E5EC',
        'neu-text': '#3D4852',
        'neu-muted': '#6B7280',
        'neu-accent': '#6C63FF',
        'neu-accent-light': '#8B84FF',
        'neu-teal': '#38B2AC',
      },
      borderRadius: {
        // Neumorphism radius
        'neu-container': '32px',
        'neu-base': '16px',
        'neu-inner': '12px',
      },
      boxShadow: {
        // Neumorphism shadows
        'neu-extruded': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        'neu-extruded-hover': '12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)',
        'neu-extruded-small': '5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)',
        'neu-inset': 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
        'neu-inset-deep': 'inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)',
        'neu-inset-small': 'inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Neumorphism animations
        'float': 'float 3s ease-in-out infinite',
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
        // Neumorphism floating animation
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
