import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BrandingPanelProps {
  className?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

const BrandingPanel: React.FC<BrandingPanelProps> = ({ 
  className = "",
  showBackButton = true,
  backButtonText = "Back to Home",
  backButtonPath = "/"
}) => {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col justify-center p-8 lg:p-16 mb-80 ${className}`}>
      {/* Back Button */}
      {showBackButton && (
        <button 
          onClick={() => navigate(backButtonPath)} 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-56 group"
          aria-label={backButtonText}
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backButtonText}
        </button>
      )}

      {/* Logo and Title */}
      <div className="mb-12 ml-28">
        <div className="text-4xl lg:text-6xl font-bold mb-4">
          <span className="text-cyan-400">ArbiTrage</span>
          <span className="text-purple-400 ml-2">Pro</span>
        </div>
        <p className="text-xl text-slate-300 font-light">
          Cross-Chain Arbitrage Insights Platform
        </p>
      </div>

      {/* Feature List */}
      <div className="space-y-6 ml-28">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-slate-300 text-lg">Monitor token prices across multiple blockchains.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-slate-300 text-lg">Detect profitable arbitrage opportunities in real-time.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-slate-300 text-lg">Leverage ML-powered scoring for smarter decisions.</span>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;