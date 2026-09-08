export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ivory: '#FDFCFA',
        sand: '#F5F1EB',
        greige: '#EAE4DB',
        line: '#E4DED4',
        ink: '#1B1917',
        muted: '#6F6860',
        whatsapp: {
          DEFAULT: '#25D366',
          deep: '#0E6B3E',
          tint: '#EEF7F1',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      letterSpacing: {
        wordmark: '0.34em',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      boxShadow: {
        float: '0 12px 32px -12px rgba(27, 25, 23, 0.28)',
      },
    },
  },
  plugins: [],
}
