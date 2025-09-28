/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Bebas Neue', 'Inter', 'system-ui', 'sans-serif'],
        bebas: ['Bebas Neue', 'cursive'],
      },
    },
  },
  plugins: [],
}