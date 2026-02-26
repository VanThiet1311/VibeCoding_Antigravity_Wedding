import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                serif: ["var(--font-playfair)", "serif"],
            },
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                surface: "var(--color-surface)",
                border: "var(--color-border)",
                "champagne-light": "var(--color-champagne-light)",
                wedding: {
                    50: "#fff1f2",
                    100: "#ffe4e6",
                    200: "#fecdd3",
                    300: "#fda4af",
                    400: "#fb7185",
                    500: "#f43f5e",
                    600: "#e11d48",
                    700: "#be123c",
                    800: "#9f1239",
                    900: "#881337",
                },
                sage: {
                    50: "#f8faf8",
                    100: "#ecf2ec",
                    200: "#d5e4d5",
                    300: "#b0ccb0",
                    400: "#84ad84",
                    500: "#608f60",
                    600: "#4a714a",
                    700: "#3c5c3c",
                    800: "#334d33",
                    900: "#2b402b",
                },
            },
            boxShadow: {
                soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
                card: "0 4px 24px -8px rgba(228, 29, 72, 0.12)",
            },
            borderRadius: {
                xl: "0.75rem",
                "2xl": "1rem",
            },
        },
    },
    plugins: [],
};

export default config;
