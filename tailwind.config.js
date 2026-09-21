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
        // Museo: papel blanco cálido, tinta negra, un solo acento (el amarillo
        // ácido del manual). Todo sale de las variables de index.css para que
        // el acento o el tono del papel se cambien en un solo sitio.
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        // Se conservan para el símbolo de marca y el visor a pantalla completa.
        'brand-yellow': '#C9C41C',
        'brand-dark': '#0A0A0A',
        'brand-cream': '#E8E6E1',
      },
      fontFamily: {
        serif: ['"Playfair Display Variable"', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
        sans: ['"Archivo Variable"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderColor: {
        hair: 'var(--hair)',
        'hair-soft': 'var(--hair-soft)',
      },
    },
  },
  plugins: [],
};
