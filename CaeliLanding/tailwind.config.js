export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FDFCFA',
        'ivory-warm': '#F7F3EE',
        sand: '#F0EAE0',
        greige: '#E8E0D4',
        line: '#DDD5C8',
        ink: '#2C2416',
        muted: '#7A6E61',
        gold: {
          DEFAULT: '#C5A059',
          light: '#D4AF6F',
          dark: '#9E7B38',
          pale: '#F5EDD8',
        },
        champagne: '#EDD9A3',
        rose: '#D4A09A',
        whatsapp: {
          DEFAULT: '#4E876A', // Softer, elegant green
          deep: '#3A6850',
          tint: '#EEF3F0',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: [
          'Playfair Display',
          'Georgia',
          'ui-serif',
          'serif',
        ],
      },
      letterSpacing: {
        wordmark: '0.34em',
        wide: '0.12em',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      boxShadow: {
        float: '0 12px 32px -12px rgba(44, 36, 22, 0.28)',
        card: '0 4px 24px -8px rgba(44, 36, 22, 0.12)',
        'card-hover': '0 12px 40px -12px rgba(44, 36, 22, 0.22)',
        gold: '0 8px 32px -8px rgba(197, 160, 89, 0.35)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #D4AF6F 50%, #9E7B38 100%)',
        'hero-gradient': 'linear-gradient(180deg, #F7F3EE 0%, #FDFCFA 100%)',
      },
      animation: {
        'slide-in': 'slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
