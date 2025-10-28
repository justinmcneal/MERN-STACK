import React from 'react';

interface PreferencesInfoBannerProps {
  thresholds: {
    minProfit: number;
    maxGasCost: number;
    minROI?: number;
    minScore?: number;
  };
  uniqueTokensInDb: number;
  formatCurrency: (value: number) => string;
}

const PreferencesInfoBanner: React.FC<PreferencesInfoBannerProps> = ({
  thresholds,
  uniqueTokensInDb,
  formatCurrency
}) => {
  if (!thresholds) return null;

  return (
    <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-purple-300 text-sm font-medium mb-1">
            All Tokens View
          </p>
          <p className="text-purple-300/80 text-xs">
            Showing opportunities for all available tokens.
            {' • '}Min Profit: <span className="font-semibold">{formatCurrency(thresholds.minProfit)}</span>
            {' • '}Max Gas: <span className="font-semibold">{formatCurrency(thresholds.maxGasCost)}</span>
            {thresholds.minROI !== undefined && thresholds.minROI > 0 && ` • Min ROI: ${thresholds.minROI}%`}
            {thresholds.minScore !== undefined && thresholds.minScore > 0 && ` • Min Score: ${(thresholds.minScore * 100).toFixed(0)}%`}
          </p>
          <p className="text-purple-400/60 text-xs mt-1 italic">
            System has live data for {uniqueTokensInDb} tokens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesInfoBanner;
