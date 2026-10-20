import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#060913",
          900: "#0a0f1d",
          850: "#0f1629",
          800: "#151d38",
          700: "#1e294b",
          600: "#2d3b66",
        },
        glow: {
          amber: "#f59e0b",
          warm: "#fbbf24",
          soft: "#fde68a",
          gold: "#eab308",
        },
        dusk: {
          lavender: "#818cf8",
          purple: "#a855f7",
          violet: "#c084fc",
          mist: "#e0e7ff",
        },
        civic: {
          teal: "#0d9488",
          emerald: "#10b981",
          rose: "#f43f5e",
          sky: "#0284c7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      boxShadow: {
        lantern: "0 0 25px -3px rgba(245, 158, 11, 0.45)",
        "lantern-lg": "0 0 45px -5px rgba(251, 191, 36, 0.6)",
        "neon-accessible": "0 0 15px 2px rgba(56, 189, 248, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-gentle": "float 4s ease-in-out infinite",
        "lantern-flicker": "flicker 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.88" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
