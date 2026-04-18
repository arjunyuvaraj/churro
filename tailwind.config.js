/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          dark: '#C2410C',
          light: '#FFEDD5'
        },
        secondary: '#1E3A5F',
        surface: '#FAFAF8',
        card: '#FFFFFF',
        text: {
          primary: '#1C1917',
          secondary: '#78716C'
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        border: '#E7E5E4'
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        soft: '0 10px 30px rgba(28, 25, 23, 0.06)'
      }
    }
  },
  plugins: []
};
