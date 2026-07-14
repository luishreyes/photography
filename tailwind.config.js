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
        // Editorial palette — acid yellow on near-black
        'brand-yellow': '#C9C41C',
        'brand-yellow-dark': '#A8A417',
        'brand-dark': '#0A0A0A',
        'brand-cream': '#E8E6E1',
        'brand-gray': '#8C887D',
      },
      fontFamily: {
        // Monumental condensed display + clean tracked body
        disp: ['"Big Shoulders Display Variable"', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        sans: ['"Archivo Variable"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
