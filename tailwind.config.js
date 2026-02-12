/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode color scheme for music production
        'app-bg': '#0f0f0f',
        'panel-bg': '#1a1a1a',
        'control-bg': '#2d2d2d',
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'text-primary': '#e5e5e5',
        'text-secondary': '#a3a3a3',
        'text-muted': '#525252',
      },
    },
  },
  plugins: [],
}
