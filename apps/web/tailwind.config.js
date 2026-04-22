/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic theme colors - Light theme
        'app-bg': '#f5f5f5',
        'card-bg': '#ffffff',
        'card-header': '#f9fafb',
        'control-bg': '#f9fafb',
        'control-border': '#d1d5db',
        'control-hover': '#f3f4f6',
        
        // Borders and dividers
        'border-light': '#e5e7eb',
        'border-default': '#d1d5db',
        
        // Text colors
        'text-primary': '#111827',
        'text-secondary': '#4b5563',
        'text-muted': '#6b7280',
        
        // Accent colors
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'accent-purple': '#a855f7',
        'accent-cyan': '#06b6d4',
        'accent-amber': '#f59e0b',
        'accent-rose': '#f43f5e',
        
        // State colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
    },
  },
  plugins: [],
}
