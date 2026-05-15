/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdfbf8",
          100: "#f7f1e9",
          200: "#ebe0d1",
          300: "#d7c9b8",
          400: "#a8917a",
          500: "#817261",
          600: "#675c50",
          700: "#4b443d",
          800: "#302c28",
          900: "#211f1c",
          950: "#151310",
        },
        accent: {
          50: "#e8f4ef",
          100: "#c8e5da",
          200: "#94cbbb",
          300: "#5eaa9a",
          400: "#218374",
          500: "#007965",
          600: "#006b5b",
          700: "#005348",
          800: "#003f37",
          900: "#00352e",
          950: "#002820",
        },
        clay: {
          50: "#fbefe9",
          100: "#f1d4c7",
          300: "#c98263",
          500: "#9b3f23",
          700: "#71301e",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
