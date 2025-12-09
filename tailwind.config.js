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
        // Official-ish Jewel Palette
        jewel: {
          900: '#14312b', // Deepest Green (Header text)
          800: '#1d463d', // Primary Buttons
          500: '#008568', // Bright Teal accents
          gold: '#c5a059', // Premium Gold (for "View Ticket" / Awards)
          light: '#f9fafb', // Background Gray
        }
      }
    },
  },
  plugins: [],
}