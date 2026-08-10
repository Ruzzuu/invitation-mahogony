/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#EFEFF0',
        'primary-dark': '#401801',
        mahogany: '#401801',
        ivory: '#EFEFF0',
        dark: '#401801',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        script2: ['"Dancing Script"', 'cursive'],
        script3: ['"Pinyon Script"', 'cursive'],
      },
      animation: {
        'fade-up': 'fadeInUp 0.8s ease both',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(239,239,240,0.5)' },
          '70%': { boxShadow: '0 0 0 20px rgba(239,239,240,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,239,240,0)' },
        },
      },
    },
  },
  plugins: [],
}
