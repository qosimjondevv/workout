/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Ilovaning yagona rang manbai (eski constants.js o'rnida).
        // Ishlatilishi: bg-brand-bg, text-brand-accent, border-brand-line ...
        brand: {
          bg: "#121212",
          surface: "#1B1B1D",
          surface2: "#232325",
          line: "#2E2E31",
          accent: "#D4FF3D",
          accent2: "#FF5A4E",
          text: "#F3F3EF",
          muted: "#8C8C90",
        },
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
    },
  },
  plugins: [],
};
