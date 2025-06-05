import { createContext } from 'react';
import { Theme } from './theme';

export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined); 