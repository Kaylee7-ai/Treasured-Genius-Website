import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#110E0D',
        burgundy: '#35151F',
        champagne: '#C4A477',
        ivory: '#EDE3D5',
        taupe: '#65534A',
        rose: '#D9B6A8',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
};

export default config;
