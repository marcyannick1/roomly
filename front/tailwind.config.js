/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f7f5',
          100: '#e0e9e4',
          200: '#c1d3c9',
          300: '#a2bdae',
          400: '#93b8a3',
          500: '#8fb895',
          600: '#7a9e7d',
          700: '#648466',
          800: '#4e6a50',
          900: '#38503a',
        },
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}
