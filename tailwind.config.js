/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7F4',
        muted: '#F0ECE8',
        'warm-border': '#E8DDD5',
        'warm-gray': '#9E978E',
        'text-main': '#2C2825',
        primary: {
          DEFAULT: '#C07B54',
          light: '#E8A87C',
          dark: '#9A5C38',
        },
        rodrigo: {
          DEFAULT: '#F97316',
          light: '#FDBA74',
          dark: '#C2570E',
        },
        maiana: {
          DEFAULT: '#52B788',
          light: '#ABEBC6',
          dark: '#2D8A5E',
        },
        both: {
          DEFAULT: '#9B72CF',
          light: '#DDD6FE',
          dark: '#6D4EAE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(44, 40, 37, 0.08)',
        'card': '0 1px 4px rgba(44, 40, 37, 0.06)',
      },
    },
  },
  plugins: [],
}
