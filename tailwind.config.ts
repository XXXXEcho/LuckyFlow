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
        // Cyberpunk Neon Theme
        neon: {
          pink: "#ff2d95",
          cyan: "#00f0ff",
          purple: "#b026ff",
          yellow: "#f0ff00",
          green: "#39ff14",
        },
        cyber: {
          dark: "#0a0a0f",
          darker: "#050508",
          card: "#12121a",
          border: "#1e1e2e",
        },
      },
      fontFamily: {
        cyber: ["Orbitron", "sans-serif"],
        display: ["Rajdhani", "sans-serif"],
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slot-roll": "slot-roll 0.1s linear infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            boxShadow: "0 0 5px theme(colors.neon.cyan), 0 0 20px theme(colors.neon.cyan)",
          },
          "50%": {
            boxShadow: "0 0 20px theme(colors.neon.cyan), 0 0 40px theme(colors.neon.cyan)",
          },
        },
        "glow": {
          "from": {
            textShadow: "0 0 10px #fff, 0 0 20px #fff, 0 0 30px theme(colors.neon.cyan)",
          },
          "to": {
            textShadow: "0 0 20px #fff, 0 0 30px theme(colors.neon.pink), 0 0 40px theme(colors.neon.pink)",
          },
        },
        "slot-roll": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 5px theme(colors.neon.cyan), 0 0 20px theme(colors.neon.cyan)",
        "neon-pink": "0 0 5px theme(colors.neon.pink), 0 0 20px theme(colors.neon.pink)",
        "neon-purple": "0 0 5px theme(colors.neon.purple), 0 0 20px theme(colors.neon.purple)",
      },
    },
  },
  plugins: [],
};

export default config;

