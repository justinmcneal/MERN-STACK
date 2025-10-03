import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="
            w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl 
            text-slate-300 appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {placeholder && (
            <option value="" className="bg-slate-900 text-slate-300">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-slate-900 text-slate-300"
            >
              {option.label}
            </option>
          ))}
        </select>
        <svg 
          className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Select;
