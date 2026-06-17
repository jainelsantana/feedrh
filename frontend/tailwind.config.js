/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'rh-purple': '#6200EE',
        'rh-neon': '#B388FF',
        'rh-gray-purple': '#F3E5F5',
        'rh-dark': '#311B92'
      }
    },
  },
  plugins: [],
}
