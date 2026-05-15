/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
      colors: {
        ocean: {
          50:  '#e8f4ff',
          100: '#b8d8f8',
          200: '#7ec8f5',
          300: '#4fa3e8',
          400: '#2580cc',
          500: '#1560aa',
          600: '#0d4080',
          700: '#0a2a5c',
          800: '#071a3a',
          900: '#04101f',
        },
        island: {
          green:  '#2d6a4f',
          light:  '#3aaa60',
          sand:   '#c8a96e',
          blue:   '#5bc4f5',
          purple: '#c084fc',
          gold:   '#f5c842',
          coral:  '#f5756a',
          teal:   '#5de8a0',
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #04101f 0%, #0a1628 40%, #0d2240 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #4fa3e8, #5bc4f5)',
        'gold-gradient': 'linear-gradient(135deg, #f5c842, #e8a000)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flame': 'flame 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%, 100%': { transform: 'translateX(-30%) scaleX(1)', opacity: '0.6' },
          '50%': { transform: 'translateX(10%) scaleX(1.3)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(91,196,245,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(91,196,245,0)' },
        },
        flame: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glow-blue': '0 0 20px rgba(91,196,245,0.3)',
        'glow-gold': '0 0 20px rgba(245,200,66,0.3)',
        'glow-green': '0 0 20px rgba(93,232,160,0.3)',
      },
    },
  },
  plugins: [],
}
