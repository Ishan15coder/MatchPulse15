/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#10b981', // emerald-500
          light:   '#34d399', // emerald-400
          dark:    '#059669', // emerald-600
        },
      },
    },
  },
  plugins: [],
}
