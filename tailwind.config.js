/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.{html,handlebars}"],
  theme: {
    extend: {
      colors:{
        complement:"#FF6347",
        dark:"#1E1E1E"
      },
      fontFamily:{
        roboto:"Roboto"
      }
    },
  },
  plugins: [],
}
