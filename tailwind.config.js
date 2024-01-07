/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        bg: "#F2E3DB",
        third: "#41644A",
        secondary: "#263A29",
        primary: "#E86A33",
      },
      fontFamily: {
        custom: ["Mansalva", "sans-serif"],
      },
    },
  },
  plugins: [],
};
