/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f2',
          100: '#f6eedf',
          200: '#eddcb8',
          300: '#e1c38a',
          400: '#d5a85e',
          500: '#c28b38',
          600: '#a76f2c',
          700: '#865426',
          800: '#6f4425',
          900: '#5c3922',
          950: '#341d10',
        },
        emerald: {
          750: '#06664e',
          850: '#044c3a',
          950: '#022c22',
        }
      },
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
