import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF5E62',
          50: '#FFF0F0',
          100: '#FFE0E1',
          200: '#FFC1C3',
          300: '#FFA2A5',
          400: '#FF8387',
          500: '#FF5E62',
          600: '#FF2E33',
          700: '#FD0008',
          800: '#C50006',
          900: '#8D0004',
        },
        orange: {
          DEFAULT: '#FF9966',
          warm: '#FF9966',
        },
        dark: {
          DEFAULT: '#0F0F0F',
          card: '#1A1A1A',
          hover: '#252525',
          border: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#00D4AA',
          success: '#00D4AA',
        },
        muted: {
          DEFAULT: '#A0A0A0',
          foreground: '#A0A0A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-coral': 'linear-gradient(135deg, #FF5E62 0%, #FF9966 100%)',
        'gradient-coral-hover':
          'linear-gradient(135deg, #FF4E52 0%, #FF8956 100%)',
        'gradient-mesh':
          'radial-gradient(at 40% 20%, hsla(0, 100%, 69%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(30, 100%, 70%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(0, 100%, 69%, 0.08) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 94, 98, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 94, 98, 0.6)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
