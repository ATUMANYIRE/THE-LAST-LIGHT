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
        // New game identity palette
        ivory: "#F6F3EB",
        limestone: "#DDD7CB",
        paper: "#EDE8DC",
        sage: "#8D9B87",
        sky: "#A9C7D8",
        ink: "#25343B",
        "ink-muted": "#4A5E68",
        coral: "#C87D70",
        brass: "#B59A67",
        // Chapter-specific dark tones (for Ch3 night)
        night: {
          950: "#0E1820",
          900: "#141F2A",
          800: "#1A2830",
          700: "#20323E",
        },
        // Legacy - kept for backwards compat with tests/engine that may reference
        midnight: {
          950: "#060913",
          900: "#0a0f1d",
          850: "#0f1629",
          800: "#151d38",
          700: "#1e294b",
          600: "#2d3b66",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      boxShadow: {
        warm: "0 4px 20px rgba(37, 52, 59, 0.15)",
        "warm-lg": "0 8px 40px rgba(37, 52, 59, 0.22)",
        brass: "0 0 20px -3px rgba(181, 154, 103, 0.4)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-gentle": "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
