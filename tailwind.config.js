/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './layouts/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        champagne: '#E6C200',
        ink: '#000000'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        glow: '0 10px 30px rgba(230, 194, 0, 0.2)'
      },
      backgroundImage: {
        sheen: 'linear-gradient(120deg, rgba(230,194,0,0) 0%, rgba(230,194,0,0.35) 50%, rgba(230,194,0,0) 100%)'
      }
    }
  },
  plugins: []
};
