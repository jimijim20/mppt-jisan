/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { navy:{900:"#0b1b2b",800:"#0f2a44",700:"#153a5a"}, accent:{500:"#22d3ee",400:"#67e8f9"} },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.25)" }
    }
  },
  plugins: []
};