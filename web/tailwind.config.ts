import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#f8fafc",
        muted: "#94a3b8",
        line: "#334155",
        paper: "#1e293b",
        brand: "#22c55e",
        accent: "#f59e0b",
        surface: "#1e293b",
        canvas: "#0f172a",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
