/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "#06B6D4",
        secondary: "#8B5CF6",
        dark: "#050816",
      },

      boxShadow: {
        glow: "0 0 40px rgba(6,182,212,0.35)",
        card: "0 10px 40px rgba(0,0,0,0.35)",
      },

      backdropBlur: {
        xs: "2px",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        gradient: "gradient 8s linear infinite",
        shine: "shine 3s linear infinite",
        blob: "blob 7s infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-15px)",
          },
        },

        gradient: {
          "0%,100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },

        shine: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(200%)",
          },
        },

        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },

  plugins: [require("tailwindcss-animate"), require("@tailwindcss/line-clamp")],
};
