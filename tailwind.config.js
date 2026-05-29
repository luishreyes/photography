/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
    '!./dist/**',
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#FFBF00',
        'brand-yellow-dark': '#E6AC00',
        'brand-dark': '#1A1A1A',
        'brand-gray': '#555555',
      },
      fontFamily: {
        sans: ['"Manrope Variable"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
