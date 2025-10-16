import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useThemeClasses } from '../../ThemeAware';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { actualTheme, toggleTheme } = useTheme();

  const { bg, border } = useThemeClasses();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg ${bg}/50 border ${border}/50 hover:opacity-90 transition-all ${className}`}
      title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {actualTheme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
