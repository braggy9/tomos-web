import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        priority: {
          urgent: "#ef4444",
          high: "#f97316",
          medium: "#3b82f6",
          low: "#6b7280",
        },
        status: {
          active: "#3b82f6",
          completed: "#22c55e",
          on_hold: "#f59e0b",
          archived: "#6b7280",
          todo: "#8b5cf6",
          in_progress: "#3b82f6",
          done: "#22c55e",
          blocked: "#ef4444",
          draft: "#9ca3af",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
};

export default config;
