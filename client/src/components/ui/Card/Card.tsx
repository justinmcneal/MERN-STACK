import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-slate-800/50 border-slate-700/50',
    glass: 'bg-slate-900/80 backdrop-blur-sm border-slate-700/50 hover:border-cyan-400/30',
    gradient: 'bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-slate-900/80 border-slate-700/50 hover:border-cyan-400/30',
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
