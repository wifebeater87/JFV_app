/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        jewel: {
          900: '#064e3b', // Deep forest green
          500: '#10b981', // Bright emerald
          100: '#d1fae5', // Light mist
        }
      }
    },
  },
  plugins: [],
}