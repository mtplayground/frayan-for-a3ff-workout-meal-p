import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-canvas": "#f4f8f7",
        ink: {
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          900: "#172033",
        },
        mist: {
          50: "#f7faf9",
          100: "#edf5f2",
          200: "#d8e8e3",
        },
        ocean: {
          50: "#eaf6fb",
          600: "#0f7ea3",
          700: "#0b6685",
        },
        leaf: {
          50: "#edf8f0",
          500: "#2fb36d",
          700: "#1f7a4b",
        },
        amber: {
          50: "#fff7e6",
          700: "#a46312",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [forms],
};
