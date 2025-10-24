import React from 'react';
import { useTokenContext } from '../../context/useTokenContext';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, color = 'cyan' }) => (
  <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>{icon}</div>
          <span className="text-sm text-slate-400 font-medium">{title}</span>
        </div>
        <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
        <div className="text-sm text-slate-400">{subtitle}</div>
      </div>
    </div>
  </div>
);

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

  // Calculate total tracked tokens
  const totalTokens = tokens?.length || 0;

  // Best opportunity card
  const bestOppValue = bestOpportunity
    ? `${bestOpportunity.tokenSymbol} ${bestOpportunity.priceDiffPercent ? `+${bestOpportunity.priceDiffPercent.toFixed(1)}%` : ''}`
    : 'No opportunities';
  
  const bestOppSubtitle = bestOpportunity
    ? `$${bestOpportunity.netProfitUsd.toFixed(0)} Profit | ${bestOpportunity.chainFrom} → ${bestOpportunity.chainTo}`
    : 'Waiting for price data...';

  // Top token card
  const topTokenValue = topToken?.symbol || 'Calculating...';
  const topTokenSubtitle = topToken
    ? `${topToken.avgSpread.toFixed(1)}% avg spread | ${topToken.chains.length} chains`
    : 'Analyzing spreads...';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <StatCard 
        icon={<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} 
        title="Best Current Arbitrage Opportunity" 
        value={bestOppValue}
        subtitle={bestOppSubtitle}
        color="cyan" 
      />
      <StatCard 
        icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} 
        title="Top Token by Spread" 
        value={topTokenValue}
        subtitle={topTokenSubtitle}
        color="purple" 
      />
      <StatCard 
        icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} 
        title="Total Tracked Tokens" 
        value={loading ? '...' : totalTokens.toString()}
        subtitle={`Across ${tokens ? new Set(tokens.map(t => t.chain)).size : 0} chains`}
        color="emerald" 
      />
    </div>
  );
};

export default StatCardsWrapper;
