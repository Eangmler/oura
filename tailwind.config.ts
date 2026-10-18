import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F0F0F",
        paper: "#F6F4F1",
        soft: "#F4F3EF",
        card: "#FFFFFF",
        muted: "#78746C",
        line: "#E7E4DE",
        accent: {
          DEFAULT: "#E85D26",
          dark: "#C74A1A",
          light: "#FDF1EC",
          hover: "#D14D1A",
        },
        status: {
          green: "#166534",
          "green-bg": "#DCFCE7",
          amber: "#7A5A14",
          "amber-bg": "#FBEECB",
          red: "#B02020",
          "red-bg": "#FDF1F1",
          blue: "#1E40AF",
          "blue-bg": "#DBEAFE",
        },
      },
      fontFamily: {
        body: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        data: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        pill: "99px",
        drawer: "28px",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px rgba(0, 0, 0, 0.06)",
        float: "0 10px 30px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
