/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFFFFF',
          soft: '#F0FDFA',
          primary: '#0D9488',
          light: '#5EEAD4',
          accent: '#2DD4BF',
          border: '#CCFBF1',
          text: '#1F2937',
          muted: '#6B7280',
          card: '#FFFFFF',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(13, 148, 136, 0.08)',
        glow: '0 8px 20px rgba(13, 148, 136, 0.3)',
        teal: '0 16px 40px rgba(13, 148, 136, 0.16)',
      },
      backgroundImage: {
        'teal-layered':
          'radial-gradient(circle at 20% 30%, rgba(13,148,136,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(45,212,191,0.08), transparent 40%), #FFFFFF',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' },
        },
      },
      animation: {
        drift: 'drift 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
