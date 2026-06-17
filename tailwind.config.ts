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
        primary: {
          50: "#faf7f5",
          100: "#f3ede8",
          200: "#e8ddd4",
          300: "#d4c4b5",
          400: "#bfa592",
          500: "#a88a74",
          600: "#9a7763",
          700: "#816253",
          800: "#6a5147",
          900: "#57443c",
          950: "#2e2320",
        },
        accent: {
          50: "#fef7ee",
          100: "#fdedd7",
          200: "#fad7ae",
          300: "#f6ba7a",
          400: "#f19444",
          500: "#ee7820",
          600: "#df5e16",
          700: "#b94714",
          800: "#933918",
          900: "#773116",
          950: "#401609",
        },
        warm: {
          50: "#fdfcfb",
          100: "#faf6f2",
          200: "#f5ede4",
          300: "#ede0d2",
          400: "#e2ccb8",
        },
        dark: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#b8b8b8",
          300: "#8a8a8a",
          400: "#6b6b6b",
          500: "#4a4a4a",
          600: "#333333",
          700: "#262626",
          800: "#1a1a1a",
          900: "#111111",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Source Sans 3'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        feed: "950px",
        layout: "1320px",
      },
      fontSize: {
        "poetry-sm": ["1.375rem", { lineHeight: "2.1" }],
        "poetry-base": ["1.625rem", { lineHeight: "2.2" }],
        "poetry-lg": ["1.875rem", { lineHeight: "2.3" }],
      },
      boxShadow: {
        card: "0 2px 16px rgba(46, 35, 32, 0.05)",
        "card-hover": "0 8px 32px rgba(46, 35, 32, 0.10)",
        nav: "0 1px 8px rgba(46, 35, 32, 0.04)",
        "dark-card": "0 2px 16px rgba(0, 0, 0, 0.3)",
        "dark-card-hover": "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
