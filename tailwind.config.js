/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,mjs}", "!./node_modules/**/*"],
  theme: {
    extend: {
      colors: {
        'primary': '#4C2932',
        'secondary': '#2C141A',
      },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          display: ['Krona One', 'sans-serif']
        },  
    },
  },
  plugins: [],
}

