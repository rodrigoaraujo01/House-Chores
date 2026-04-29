/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#FAFAF8',
        surface: '#F3F3EE',
        'border-line': '#EDEDE8',
        'dot-empty': '#E8E8E3',
        accent: {
          DEFAULT: '#D4856A',
          light: '#E8B09A',
          dark: '#B56D55',
        },
        'text-primary': '#2D2B28',
        'text-secondary': '#9B9790',
        rodrigo: {
          DEFAULT: '#F4A89A',
          light: '#FCDDD7',
          dark: '#D4786A',
        },
        maiana: {
          DEFAULT: '#8ECFA0',
          light: '#D2F0DA',
          dark: '#5EA874',
        },
        both: {
          DEFAULT: '#B8A9D4',
          light: '#E3DCF0',
          dark: '#8A78B0',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(44, 40, 37, 0.08)',
      },
    },
  },
  plugins: [],
}
