/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#EDE9FE',   // Purple 100
          DEFAULT: '#7C3AED', // Purple 600 (Brand Purple)
          dark: '#5B21B6',    // Purple 700
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber 500
          hover: '#D97706',   // Amber 600
        },
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':    'float 3s ease-in-out infinite',
        'marquee':  'marquee 28s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
