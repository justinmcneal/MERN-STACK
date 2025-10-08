import React from 'react';

interface Feature {
  text: string;
}

interface FeatureListProps {
  features?: Feature[];
  className?: string;
}

const defaultFeatures: Feature[] = [
  { text: "Monitor token prices across multiple blockchains." },
  { text: "Detect profitable arbitrage opportunities in real-time." },
  { text: "Leverage ML-powered scoring for smarter decisions." }
];

const FeatureList: React.FC<FeatureListProps> = ({ 
  features = defaultFeatures, 
  className = "" 
}) => {
  return (
    <div className={`space-y-6 ml-28 ${className}`}>
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-4">
          <div 
            className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <svg 
              className="w-4 h-4 text-cyan-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <span className="text-slate-300 text-lg">{feature.text}</span>
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
