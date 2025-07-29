/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        licorice:   '#170B1A',
        smokyblack: '#161211',
        russianviolet: '#370C3C',
        lavenderfloral: '#BD72D6',
        englishviolet: '#50415D',
      },
      backgroundImage: {
        'galaxy-violet': 'linear-gradient(180deg, #161211 0%, #170B1A 25%, #370C3C 60%, #50415D 90%, #0a0512 100%)',
      },
    }
  },
  plugins: [],
}
