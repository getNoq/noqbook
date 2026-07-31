/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        yolk: '#FFD900',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Bebas Neue"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
