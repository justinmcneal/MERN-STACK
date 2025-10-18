/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light theme colors
        'light-bg': '#ffffff',
        'light-surface': '#f8fafc',
        'light-surface-secondary': '#f1f5f9',
        'light-text': '#1e293b',
        'light-text-secondary': '#64748b',
        'light-border': '#e2e8f0',
        'light-border-secondary': '#cbd5e1',
        
        // Dark theme colors (existing)
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-surface-secondary': '#334155',
        'dark-text': '#f1f5f9',
        'dark-text-secondary': '#94a3b8',
        'dark-border': '#475569',
        'dark-border-secondary': '#64748b',
      }
    },
  },
  plugins: [],
}