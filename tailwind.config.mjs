/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: { 
          DEFAULT: "#0b1220", 
          soft: "#0f1526" 
        },
        ink: { 
          DEFAULT: "#e6e9ef", 
          mute: "#aab2c0" 
        },
        accent: { 
          DEFAULT: "#5aa2ff", 
          dim: "#2c66c7" 
        },
        border: "#1b2335",
      },
      borderRadius: { 
        lg: "10px", 
        xl: "14px" 
      },
      boxShadow: { 
        card: "0 1px 0 #0f1526, 0 12px 30px rgba(0,0,0,.35)" 
      },
      fontFamily: {
        sans: [
          'SF Pro Text',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'JetBrains Mono',
          'Menlo',
          'Monaco',
          'Courier New',
          'monospace'
        ]
      },
      backdropSaturate: {
        140: '1.4'
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}