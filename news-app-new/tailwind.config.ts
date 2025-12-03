import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        leanLeft: '#3B82F6',
        leanRight: '#EF4444',
        leanCenter: '#FBBF24'
      },
      boxShadow: {
        glow: '0 0 30px rgba(59,130,246,0.4)'
      }
    }
  },
  plugins: []
} satisfies Config
