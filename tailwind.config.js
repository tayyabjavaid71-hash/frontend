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
          light: '#334155',  // Slate 700ish
          DEFAULT: '#0F172A', // Slate 900 (Dark Blue Brand)
          dark: '#020617',    // Slate 950
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber 500
          hover: '#D97706',   // Amber 600
        },
        background: '#F9FAFB', // Gray 50
        surface: '#FFFFFF',
        text: '#111827',       // Gray 900
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
