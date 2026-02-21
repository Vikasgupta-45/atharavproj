import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    light: "#F5F5FC",
                    DEFAULT: "#E6E6FA", // Lavender accent requested
                    dark: "#B3B3D9",
                },
                surface: "#FFFFFF",
                background: "#F9FAFB",
            },
        },
    },
    plugins: [],
};

export default config;
