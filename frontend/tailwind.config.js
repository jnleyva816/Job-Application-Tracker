/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'oklch(var(--color-primary))',
        secondary: 'oklch(var(--color-secondary))',
        accent: 'oklch(var(--color-accent))',
        success: 'oklch(var(--color-success))',
        info: 'oklch(var(--color-info))',
        light: {
          background: 'oklch(var(--color-light-background))',
          surface: 'oklch(var(--color-light-surface))',
          text: 'oklch(var(--color-light-text))',
          textSecondary: 'oklch(var(--color-light-text-secondary))',
          border: 'oklch(var(--color-light-border))',
        },
        dark: {
          background: 'oklch(var(--color-dark-background))',
          surface: 'oklch(var(--color-dark-surface))',
          text: 'oklch(var(--color-dark-text))',
          textSecondary: 'oklch(var(--color-dark-text-secondary))',
          border: 'oklch(var(--color-dark-border))',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
} 