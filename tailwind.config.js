/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF',
        'surface-dark': '#1E2030',
        'surface-alt': '#F1F5F9',
        'surface-alt-dark': '#161825',
      },
    },
  },
  plugins: [],
}
