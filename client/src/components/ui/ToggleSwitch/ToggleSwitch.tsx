import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onChange,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-12'
  };

  const thumbClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const translateClasses = {
    sm: enabled ? 'translate-x-4' : 'translate-x-1',
    md: enabled ? 'translate-x-6' : 'translate-x-1',
    lg: enabled ? 'translate-x-5' : 'translate-x-1'
  };

  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex ${sizeClasses[size]} items-center rounded-full transition-colors
        ${enabled ? 'bg-cyan-500' : 'bg-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-900
        ${className}
      `}
    >
      <span
        className={`
          inline-block ${thumbClasses[size]} transform rounded-full bg-white transition-transform
          ${translateClasses[size]}
        `}
      />
    </button>
  );
};

export default ToggleSwitch;
