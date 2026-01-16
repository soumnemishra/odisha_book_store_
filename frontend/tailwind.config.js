export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors (Odia Cultural Theme)
        primary: {
          DEFAULT: '#E07A5F',
          50: '#FCF0ED',
          100: '#F9E1DB',
          200: '#F3C3B6',
          300: '#EDA592',
          400: '#E68E78',
          500: '#E07A5F',
          600: '#D45A3A',
          700: '#A8452D',
          800: '#7C3321',
          900: '#502115',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#3D405B',
          50: '#E8E9ED',
          100: '#D1D2DB',
          200: '#A3A6B7',
          300: '#757993',
          400: '#565A79',
          500: '#3D405B',
          600: '#31334A',
          700: '#252738',
          800: '#191A26',
          900: '#0D0D13',
          foreground: '#FFFFFF',
        },

        // Background Colors (60% of palette)
        background: {
          DEFAULT: '#F4F1DE',
          cream: '#F4F1DE',
          white: '#FFFFFF',
          light: '#FAFAF8',
          muted: '#F5F5F4',
        },

        // CTA Colors (Conversion-focused)
        cta: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          active: '#C2410C',
          foreground: '#FFFFFF',
        },

        // Trust & Security (Blue tones)
        trust: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
          muted: '#DBEAFE',
        },

        // Success (Green - Checkout, Confirmations)
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
          muted: '#D1FAE5',
          foreground: '#FFFFFF',
        },

        // Warning (Amber - Alerts, Low Stock)
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
          muted: '#FEF3C7',
          foreground: '#FFFFFF',
        },

        // Error (Rose - Form errors, Out of Stock)
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
          muted: '#FEE2E2',
          foreground: '#FFFFFF',
        },

        // Sale (Crimson - Discounts, Urgency)
        sale: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
          badge: '#FEF2F2',
          foreground: '#FFFFFF',
        },

        // Legacy support
        'background-cream': '#F4F1DE',
        'muted-gold': '#D4AF37',
        terracotta: '#A0522D',
        charcoal: '#2F3E46',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
