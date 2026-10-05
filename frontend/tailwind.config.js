/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f7ef',
          100: '#dfeec9',
          500: '#5aac4e',
          700: '#2e6f3d',
          900: '#143326'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)'
      }
    },
  },
  plugins: [],
};
