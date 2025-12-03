// tailwind.config.js
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                neonBlue: "#3B82F6",
                neonRed: "#EF4444",
                neonGold: "#FBBF24",
                spaceDark: "#0A0A0A"
            },
            keyframes: {
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 8px var(--tw-shadow-color)" },
                    "50%": { boxShadow: "0 0 16px var(--tw-shadow-color)" }
                }
            },
            animation: {
                pulseGlow: "pulseGlow 2s infinite"
            }
        }
    },
    plugins: []
};
