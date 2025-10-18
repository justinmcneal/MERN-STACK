import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeAwareProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ThemeAware component that provides theme-aware styling
 * Usage: Wrap components with <ThemeAware> to get theme-aware classes
 */
export const ThemeAware: React.FC<ThemeAwareProps> = ({ children, className = '' }) => {
  const { actualTheme } = useTheme();
  
  // Add theme-specific classes to the wrapper
  const themeClasses = actualTheme === 'dark' 
    ? 'dark bg-slate-950 text-white' 
    : 'light bg-white text-slate-900';
  
  return (
    <div className={`${themeClasses} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Hook to get theme-aware classes
 */
export const useThemeClasses = () => {
  const { actualTheme } = useTheme();
  
  return {
    // Background classes
    bg: actualTheme === 'dark' ? 'bg-slate-950' : 'bg-white',
    bgSecondary: actualTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-50',
    bgSurface: actualTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
    
    // Text classes
    text: actualTheme === 'dark' ? 'text-white' : 'text-slate-900',
    textSecondary: actualTheme === 'dark' ? 'text-slate-300' : 'text-slate-600',
    textMuted: actualTheme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    
    // Border classes
    border: actualTheme === 'dark' ? 'border-slate-700' : 'border-slate-200',
    borderSecondary: actualTheme === 'dark' ? 'border-slate-600' : 'border-slate-300',
    
    // Input classes
    input: actualTheme === 'dark' 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500',
    
    // Card classes
    card: actualTheme === 'dark' 
      ? 'bg-slate-800/50 border-slate-700/50' 
      : 'bg-white border-slate-200',
    
    // Button classes
    buttonPrimary: actualTheme === 'dark'
      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500'
      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500',
    
    buttonSecondary: actualTheme === 'dark'
      ? 'bg-slate-700 hover:bg-slate-600 text-white'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-900',
    
    // Shadow classes
    shadow: actualTheme === 'dark' ? 'shadow-slate-900/50' : 'shadow-slate-200/50',
    
    // Theme-specific gradients
    gradient: actualTheme === 'dark'
      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      : 'bg-white',
  };
};
