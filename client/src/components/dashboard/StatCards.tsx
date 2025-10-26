import React, { useMemo } from 'react';
import { useTokenContext } from '../../context/useTokenContext';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, color = 'cyan' }) => {
  // Use inline styles for dynamic colors to avoid Tailwind purging issues
  const colorMap = {
    cyan: { bg: 'rgba(6, 182, 212, 0.2)', text: '#22d3ee' },
    purple: { bg: 'rgba(168, 85, 247, 0.2)', text: '#a78bfa' },
    emerald: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399' }
  };
  
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.cyan;

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.bg }}
            >
              {icon}
            </div>
            <span className="text-sm text-slate-400 font-medium">{title}</span>
          </div>
          <div 
            className="text-2xl font-bold mb-1"
            style={{ color: colors.text }}
          >
            {value}
          </div>
          <div className="text-sm text-slate-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

interface StatCardsWrapperProps {
  bestOpportunity?: {
    tokenSymbol: string;
    priceDiffPercent?: number;
    netProfitUsd: number;
    chainFrom: string;
    chainTo: string;
  } | null;
  topToken?: {
    symbol: string;
    avgSpread: number;
    chains: string[];
  } | null;
}

const StatCardsWrapper: React.FC<StatCardsWrapperProps> = ({ bestOpportunity, topToken }) => {
  const { tokens, loading } = useTokenContext();

  // Calculate unique token symbols and chains
  const { uniqueTokens, uniqueChains } = useMemo(() => {
    if (!tokens || tokens.length === 0) {
      return { uniqueTokens: 0, uniqueChains: 0 };
    }

    const symbolSet = new Set(tokens.map(t => t.symbol.toUpperCase()));
    const chainSet = new Set(tokens.map(t => t.chain.toLowerCase()));

    return {
      uniqueTokens: symbolSet.size,
      uniqueChains: chainSet.size
    };
  }, [tokens]);

  // Calculate total token entries (symbol × chain combinations)
  const totalTokenEntries = tokens?.length || 0;

  // Best opportunity card - show actual best opportunity or "None found"
  const bestOppValue = bestOpportunity
    ? `${bestOpportunity.tokenSymbol} ${bestOpportunity.priceDiffPercent ? `+${bestOpportunity.priceDiffPercent.toFixed(1)}%` : ''}`
    : 'None found';
  
  const bestOppSubtitle = bestOpportunity
    ? `$${bestOpportunity.netProfitUsd.toFixed(2)} profit | ${bestOpportunity.chainFrom} → ${bestOpportunity.chainTo}`
    : 'No profitable opportunities currently';

  // Top token card - show token with highest average spread
  const topTokenValue = topToken?.symbol || 'No data';
  const topTokenSubtitle = topToken
    ? `${topToken.avgSpread.toFixed(1)}% avg spread | ${topToken.chains.length} chains`
    : 'Calculating spreads...';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <StatCard 
        icon={
          <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        } 
        title="Best Current Arbitrage Opportunity" 
        value={bestOppValue}
        subtitle={bestOppSubtitle}
        color="cyan" 
      />
      <StatCard 
        icon={
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        } 
        title="Top Token by Spread" 
        value={topTokenValue}
        subtitle={topTokenSubtitle}
        color="purple" 
      />
            <StatCard
        icon={
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        }
        title="System Token Coverage"
        value={loading ? 'Loading...' : `${uniqueTokens} token${uniqueTokens !== 1 ? 's' : ''}`}
        subtitle={loading ? 'Fetching data...' : `${totalTokenEntries} entries across ${uniqueChains} chains`}
        color="emerald"
      />
    </div>
  );
};

export default StatCardsWrapper;
