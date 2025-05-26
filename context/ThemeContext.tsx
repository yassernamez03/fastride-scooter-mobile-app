import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  backgroundSecondary: string;
  cardBackground: string;
  text: string;
  secondaryText: string;
  placeholderText: string;
  border: string;
  inputBackground: string;
  error: string;
  errorBackground: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  info: string;
  infoBackground: string;
  accent: string;
  surface: string;
  disabled: string;
};

type ThemeContextType = {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const lightColors: ThemeColors = {
  primary: '#32CD32', // Bright green
  secondary: '#1E9E1E', // Darker green
  background: '#F9FAFB',
  backgroundSecondary: '#F1F5F9',
  cardBackground: '#FFFFFF',
  text: '#1F2937',
  secondaryText: '#6B7280',
  placeholderText: '#9CA3AF',
  border: '#E5E7EB',
  inputBackground: '#F9FAFB',
  error: '#EF4444',
  errorBackground: '#FEE2E2',
  success: '#10B981',
  successBackground: '#D1FAE5',
  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  info: '#3B82F6',
  infoBackground: '#DBEAFE',
  accent: '#8B5CF6',
  surface: '#F8FAFC',
  disabled: '#D1D5DB',
};

const darkColors: ThemeColors = {
  primary: '#4ADE80', // Slightly lighter green for better visibility in dark mode
  secondary: '#22C55E', // Secondary green
  background: '#111827',
  backgroundSecondary: '#1F2937',
  cardBackground: '#1F2937',
  text: '#F9FAFB',
  secondaryText: '#9CA3AF',
  placeholderText: '#6B7280',
  border: '#374151',
  inputBackground: '#374151',
  error: '#F87171',
  errorBackground: '#7F1D1D',
  success: '#34D399',
  successBackground: '#064E3B',
  warning: '#FBBF24',
  warningBackground: '#78350F',
  info: '#60A5FA',
  infoBackground: '#1E3A8A',
  accent: '#A78BFA',
  surface: '#0F172A',
  disabled: '#4B5563',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(colorScheme === 'dark' ? 'dark' : 'light');

  // Update theme when system theme changes
  useEffect(() => {
    setTheme(colorScheme === 'dark' ? 'dark' : 'light');
  }, [colorScheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const contextValue = {
    theme,
    colors: theme === 'light' ? lightColors : darkColors,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);