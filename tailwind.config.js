/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,jsx,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        card: {
          DEFAULT: "#141414",
          hover: "#1a1a1a",
        },
        border: "#262626",
        primary: {
          DEFAULT: "#a855f7",
          hover: "#9333ea",
          foreground: "#fafafa",
        },
        secondary: {
          DEFAULT: "#ec4899",
          hover: "#db2777",
          foreground: "#fafafa",
        },
        muted: {
          DEFAULT: "#262626",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#1f1f1f",
          foreground: "#fafafa",
        },
        destructive: {
          DEFAULT: "#dc2626",
          hover: "#b91c1c",
          foreground: "#fafafa",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#fafafa",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#fafafa",
        },
        info: {
          DEFAULT: "#3b82f6",
          foreground: "#fafafa",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
        "gradient-glow": "radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(168, 85, 247, 0.3)",
        "glow-strong": "0 0 30px rgba(168, 85, 247, 0.5)",
        "glow-lg": "0 0 60px rgba(168, 85, 247, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          from: { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(168, 85, 247, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [],
};