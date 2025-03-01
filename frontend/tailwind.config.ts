import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-dark": "var(--bg-dark)",
        "bg-light": "var(--bg-light)",
        "admin-bg-secondary-dark": "var(--admin-bg-secondary-dark)",
        "admin-bg-tertiary-dark": "var(--admin-bg-tertiary-dark)",
        "admin-bg-dark": "var(--admin-bg-dark)",
        "admin-text-light": "var(--admin-text-light)",
      },
      borderColor: {
        "admin-dark": "var(--border-admin-dark)",
        "admin-light": "var(--border-admin-light)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
