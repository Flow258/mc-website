// ============================================================
// TAILWIND CONFIG
// ============================================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["Inter",       "sans-serif"],
        mono:  ["Space Mono",  "monospace"],
      },
      colors: {
        // Minecraft palette additions
        mc: {
          grass:   "#5a8a2e",
          dirt:    "#8b5e3c",
          stone:   "#7f7f7f",
          diamond: "#4ae2e8",
          gold:    "#ffd700",
          redstone:"#ff0000",
          emerald: "#17dd62",
        },
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease both",
      },
      backgroundImage: {
        "grid-pattern": `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        "grid": "32px 32px",
      },
    },
  },
  plugins: [],
};
