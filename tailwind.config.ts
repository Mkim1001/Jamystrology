import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "accent-gold": "var(--accent-gold)",
        "accent-purple": "var(--accent-purple)",
        "accent-red": "var(--accent-red)",
        "accent-cyan": "var(--accent-cyan)",
        muted: "var(--text-muted)",
      },
    },
  },
  plugins: [],
};
export default config;
