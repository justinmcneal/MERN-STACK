import React from 'react';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  label,
  rows = 4,
  disabled = false,
  required = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className="
          w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl
          text-white placeholder-slate-400 resize-none
          focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
    </div>
  );
};

export default Textarea;
