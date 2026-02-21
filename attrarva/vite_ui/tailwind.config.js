/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    light: "#F0FDFA",
                    DEFAULT: "#5EEAD4",
                    dark: "#0D9488",
                    deeper: "#0F766E",
                },
                surface: "#FFFFFF",
                background: "#F0FDFA",
            },
            boxShadow: {
                glow: "0 0 20px rgba(94,234,212,0.35)",
                "glow-lg": "0 0 40px rgba(94,234,212,0.45)",
                card: "0 4px 24px rgba(13,148,136,0.10)",
                "card-hover": "0 8px 40px rgba(13,148,136,0.18)",
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
                "float-slow": "float 8s ease-in-out infinite",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(94,234,212,0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(94,234,212,0.6)" },
                },
            },
        },
    },
    plugins: [],
};
