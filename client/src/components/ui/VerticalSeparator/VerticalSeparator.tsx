import React from 'react';

interface VerticalSeparatorProps {
  className?: string;
}

const VerticalSeparator: React.FC<VerticalSeparatorProps> = ({ 
  className = "" 
}) => {
  return (
    <div 
      className={`hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5
        bg-gradient-to-b from-transparent via-slate-700 to-transparent 
        transform -translate-x-1/2
        shadow-lg
        ${className}`}
      aria-hidden="true"
    />
  );
};

export default VerticalSeparator;
