/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        slate: {
          900: '#0f172a',
          800: '#1e293b',
        },
        electric: '#3b82f6',
        cyan: '#06b6d4',
        neon: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
      },
      boxShadow: {
        neon: '0 0 12px 2px #3b82f6, 0 0 2px 0 #06b6d4',
        'neon-inset': 'inset 0 0 12px 2px #3b82f6',
        'neon-btn': '0 0 16px 2px #3b82f6, 0 0 2px 0 #06b6d4',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 8s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        pulseGlow: 'pulseGlow 2s infinite',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px #3b82f6)' },
          '50%': { filter: 'drop-shadow(0 0 16px #3b82f6)' },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
  plugins: [],
} 