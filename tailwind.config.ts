import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f5f7fa",
          100: "#e4e9f1",
          200: "#cbd4e1",
          300: "#9eadc4",
          400: "#6b7e9b",
          500: "#4a5d7d",
          600: "#384867",
          700: "#293657",
          800: "#1c2742",
          900: "#0f1729",
          950: "#070b18",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 41, 0.04), 0 4px 16px rgba(15, 23, 41, 0.06)",
        card: "0 1px 3px rgba(15, 23, 41, 0.05), 0 8px 24px rgba(15, 23, 41, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
