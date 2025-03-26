export const theme = {
  colors: {
    primary: '#00a8ff',
    secondary: '#9c88ff',
    accent: '#fbc531',
    success: '#4cd137',
    info: '#487eb0',
    light: {
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2d3436',
      textSecondary: '#636e72',
      border: '#dfe6e9',
    },
    dark: {
      background: '#1a1a1a',
      surface: '#2d3436',
      text: '#ffffff',
      textSecondary: '#b2bec3',
      border: '#636e72',
    }
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
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: '0.3s ease-in-out',
  },
} as const;

export type Theme = typeof theme; 