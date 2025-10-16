import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all ${className}`}
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
