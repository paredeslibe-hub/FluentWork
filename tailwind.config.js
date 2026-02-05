/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional neutral palette
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(240 10% 4%)',
        muted: 'hsl(240 5% 96%)',
        'muted-foreground': 'hsl(240 4% 46%)',
        border: 'hsl(240 6% 90%)',
        ring: 'hsl(239 84% 67%)',
        // Primary accent (Indigo)
        primary: {
          DEFAULT: 'hsl(239 84% 67%)',
          foreground: 'hsl(0 0% 100%)',
          50: 'hsl(239 100% 97%)',
          100: 'hsl(239 100% 94%)',
          500: 'hsl(239 84% 67%)',
          600: 'hsl(239 84% 57%)',
          700: 'hsl(239 76% 49%)',
        },
        // Semantic colors
        success: {
          DEFAULT: 'hsl(142 72% 29%)',
          foreground: 'hsl(0 0% 100%)',
          50: 'hsl(138 76% 97%)',
          100: 'hsl(141 84% 93%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 84% 60%)',
          foreground: 'hsl(0 0% 100%)',
        },
        // Slate for neutral UI elements
        slate: {
          50: 'hsl(210 40% 98%)',
          100: 'hsl(210 40% 96%)',
          200: 'hsl(214 32% 91%)',
          300: 'hsl(213 27% 84%)',
          400: 'hsl(215 20% 65%)',
          500: 'hsl(215 16% 47%)',
          600: 'hsl(215 19% 35%)',
          700: 'hsl(215 25% 27%)',
          800: 'hsl(217 33% 17%)',
          900: 'hsl(222 47% 11%)',
          950: 'hsl(229 84% 5%)',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
