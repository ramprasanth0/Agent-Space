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
        //Accent Colours
        'tekhelet': { DEFAULT: '#522d89', 100: '#10091c', 200: '#211237', 300: '#311b53', 400: '#42246f', 500: '#522d89', 600: '#703dbc', 700: '#936bcf', 800: '#b79cdf', 900: '#dbceef' },
        'purpureus': { DEFAULT: '#904eae', 100: '#1c0f22', 200: '#391f45', 300: '#552e67', 400: '#723e8a', 500: '#904eae', 600: '#a56fbe', 700: '#bc93cf', 800: '#d2b7df', 900: '#e9dbef' },
        // 'star-pop': { DEFAULT: "#FAEB92" },
        //Secondary
        'oxford_blue': { DEFAULT: '#0e0c36', 100: '#03020b', 200: '#060516', 300: '#080721', 400: '#0b0a2b', 500: '#0e0c36', 600: '#1d1660', 700: '#3429af', 800: '#736ddf', 900: '#b9b6ef' },
        //Primary
        'russian_violet': { DEFAULT: '#161148', 100: '#04030e', 200: '#08071c', 300: '#0d0a2a', 400: '#110d38', 500: '#161148', 600: '#29218b', 700: '#3e31cf', 800: '#7f76df', 900: '#bfbaef' }
      },

      backgroundImage: {
        // 'galaxy-violet': 'linear-gradient(180deg, #440e45 0%, #2a1c30 25%, #20171f 50%, #1a100d 75%,  #120b09 90%, #060f06 100%)',
        'galaxy-night': 'linear-gradient(180deg, #473346 0%, #2b1f2a 20%, #1c151c 40%, #0e0a0e 60%, #050c05 80%, #060f06 100%)'
      },
    }
  },
  plugins: [],
}



//palette
//Accent Colours
// 'thistle': { DEFAULT: '#d1bfd9', 100: '#2d1f33', 200: '#5a3d66', 300: '#875c99', 400: '#ac8cba', 500: '#d1bfd9', 600: '#dacce0', 700: '#e3d9e8', 800: '#ede6f0', 900: '#f6f2f7' },
// 'pomp_and_power': { DEFAULT: '#7c538d', 100: '#19111c', 200: '#322139', 300: '#4a3255', 400: '#634271', 500: '#7c538d', 600: '#996faa', 700: '#b293c0', 800: '#ccb7d5', 900: '#e5dbea', },
// 'star-pop': { DEFAULT: "#FAEB92" },
// //Secondary
// 'english-violet': { DEFAULT: '#473346', 100: '#0e0a0e', 200: '#1c151c', 300: '#2b1f2a', 400: '#392938', 500: '#473346', 600: '#745472', 700: '#9d789b', 800: '#bea5bd', 900: '#ded2de', },
// //Primary
// 'night': { DEFAULT: '#060f06', 100: '#010301', 200: '#020602', 300: '#030903', 400: '#050c05', 500: '#060f06', 600: '#225522', 700: '#3e9b3e', 800: '#73c773', 900: '#b9e3b9', }


//- other palette
// { 'tekhelet': { DEFAULT: '#522d89', 100: '#10091c', 200: '#211237', 300: '#311b53', 400: '#42246f', 500: '#522d89', 600: '#703dbc', 700: '#936bcf', 800: '#b79cdf', 900: '#dbceef' },
//  'purpureus': { DEFAULT: '#904eae', 100: '#1c0f22', 200: '#391f45', 300: '#552e67', 400: '#723e8a', 500: '#904eae', 600: '#a56fbe', 700: '#bc93cf', 800: '#d2b7df', 900: '#e9dbef' },
//  'oxford_blue': { DEFAULT: '#070a31', 100: '#01020a', 200: '#030414', 300: '#04061d', 400: '#060827', 500: '#070a31', 600: '#121a81', 700: '#1e2ad0', 800: '#6069e8', 900: '#b0b4f4' },
//  'russian_violet': { DEFAULT: '#161148', 100: '#04030e', 200: '#08071c', 300: '#0d0a2a', 400: '#110d38', 500: '#161148', 600: '#29218b', 700: '#3e31cf', 800: '#7f76df', 900: '#bfbaef' } }