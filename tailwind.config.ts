import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#1e1e2e",
        surface: "#313244",
        overlay: "#45475a",
        text: "#cdd6f4",
        subtext: "#a6adc8",
        blue: "#89b4fa",
        mauve: "#cba6f7",
        pink: "#f5c2e7",
        green: "#a6e3a1",
        peach: "#fab387",
        red: "#f38ba8",
        teal: "#94e2d5",
        yellow: "#f9e2af",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        glass: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-out-right": "slideOutRight 0.25s ease-in forwards",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "xp-fill": "xpFill 0.6s ease-out forwards",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "panel-in": "panelIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        xpFill: {
          "0%": { width: "0%" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(137, 180, 250, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(137, 180, 250, 0.4)" },
        },
        panelIn: {
          "0%": { transform: "translateX(100%) scale(0.92)", opacity: "0" },
          "100%": { transform: "translateX(0) scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

export default config
