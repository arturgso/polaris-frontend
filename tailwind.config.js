/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#18181B",
        surface: "#202024",
        card: "#27272A",

        border: "#3A3A40",

        accent: "#E6B94C",
        "accent-hover": "#F0C766",

        text: {
          primary: "#F4F4F5",
          secondary: "#B3B3BA",
          muted: "#7C7C84",
        },

        success: "#6FA66F",
        warning: "#D9A441",
        info: "#7292B8",
      }
    },
  },
  plugins: [],
}

