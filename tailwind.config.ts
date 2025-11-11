import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        champagne: "#E6C200",
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        premium: "0 20px 40px -25px rgba(230, 194, 0, 0.45)",
      },
      borderRadius: {
        premium: "1.5rem",
      },
      animation: {
        "fade-slide-up": "fadeSlideUp 0.8s ease-out forwards",
        "sheen": "sheen 2.4s ease-in-out infinite",
        "slow-pan": "slowPan 12s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sheen: {
          "0%": { backgroundPosition: "-200%" },
          "50%": { backgroundPosition: "200%" },
          "100%": { backgroundPosition: "200%" },
        },
        slowPan: {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.05) translate(-4px, -6px)" },
        }
      },
      backgroundImage: {
        sheen: "linear-gradient(120deg, rgba(230, 194, 0, 0) 30%, rgba(230, 194, 0, 0.35) 45%, rgba(230, 194, 0, 0) 60%)",
        "diagonal-gold": "linear-gradient(135deg, rgba(230, 194, 0, 0.75), rgba(230, 194, 0, 0.2))",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
