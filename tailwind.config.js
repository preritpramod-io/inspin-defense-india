/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A1628',
          800: '#0C1B2E',
          700: '#122340',
          600: '#1B3A5C',
          500: '#2A4A6B',
        },
        saffron: {
          500: '#FF9933',
          400: '#FFB366',
          600: '#E68A2E',
        },
        indiagreen: {
          500: '#138808',
          400: '#1DA80E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
