import React from 'react';

interface LogoSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const LogoSection: React.FC<LogoSectionProps> = ({ 
  subtitle = "Cross-Chain Arbitrage Insights Platform",
  className = ""
}) => {
  return (
    <div className={`mb-12 ml-28 ${className}`}>
      <div className="text-4xl lg:text-6xl font-bold mb-4">
        <span className="text-cyan-400">ArbiTrage</span>
        <span className="text-purple-400 ml-2">Pro</span>
      </div>
      <p className="text-xl text-slate-300 font-light">
        {subtitle}
      </p>
    </div>
  );
};

export default LogoSection;
