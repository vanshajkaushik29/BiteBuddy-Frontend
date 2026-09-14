import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core Palette ──────────────────────────────────────────────────────
        background: "#F8FAFC",     // Very light cool gray
        surface: "#FFFFFF",        // Pure white cards

        // ── Primary: Indigo ───────────────────────────────────────────────────
        primary: {
          DEFAULT: "#4F46E5",
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",   // Brand primary
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },

        // ── Secondary: Teal ───────────────────────────────────────────────────
        teal: {
          DEFAULT: "#14B8A6",
          50:  "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",  // Brand secondary
          600: "#0D9488",
          700: "#0F766E",
        },

        // ── Text ──────────────────────────────────────────────────────────────
        ink: {
          DEFAULT: "#172033",   // Main text — very dark navy
          muted: "#64748B",     // Secondary text — slate
          faint: "#94A3B8",     // Placeholder, disabled
        },

        // ── Status Colors ─────────────────────────────────────────────────────
        success: {
          DEFAULT: "#22C55E",
          50:  "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50:  "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          50:  "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
        },

        // ── Borders & Surfaces ────────────────────────────────────────────────
        border: "#E5E7EB",
        "border-light": "#F1F5F9",
        "indigo-light": "#EEF2FF",   // Light indigo tint for badges/chips
        "teal-light":   "#F0FDFA",   // Light teal tint
      },

      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        "card":    "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)",
        "card-lg": "0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -3px rgba(0,0,0,0.04)",
        "indigo":  "0 4px 14px -2px rgba(79,70,229,0.3)",
        "teal":    "0 4px 14px -2px rgba(20,184,166,0.3)",
      },

      borderRadius: {
        "xl":  "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      animation: {
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-up":   "slideUp 0.25s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
