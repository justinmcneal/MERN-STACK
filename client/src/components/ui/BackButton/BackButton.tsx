import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to = "/", 
  className = "",
  children = "Back to Home"
}) => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(to)} 
      className={`inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-56 group ${className}`}
      aria-label={`Go back to ${to === "/" ? "home page" : to}`}
    >
      <svg 
        className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      {children}
    </button>
  );
};

export default BackButton;
