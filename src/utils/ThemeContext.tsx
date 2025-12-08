import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  setColors: (colors: ThemeColors) => void;
}

const defaultColors: ThemeColors = {
  primary: '#EF7D00', // Orange
  secondary: '#198A00', // Green
  accent: '#DE2010', // Red
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [colors, setColorsState] = useState<ThemeColors>(defaultColors);

  // Load theme and colors from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('zamlove-theme') as Theme;
    const savedColors = localStorage.getItem('zamlove-colors');

    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    if (savedColors) {
      try {
        setColorsState(JSON.parse(savedColors));
      } catch (e) {
        console.error('Failed to parse saved colors');
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Apply custom colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-zamlove-primary', colors.primary);
    root.style.setProperty('--color-zamlove-secondary', colors.secondary);
    root.style.setProperty('--color-zamlove-accent', colors.accent);
  }, [colors]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('zamlove-theme', newTheme);
  };

  const setColors = (newColors: ThemeColors) => {
    setColorsState(newColors);
    localStorage.setItem('zamlove-colors', JSON.stringify(newColors));
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, setColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
