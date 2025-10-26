import React from 'react';
import type { OpportunityDto, OpportunityFlagReason } from '../../services/OpportunityService';

interface ArbitrageTableProps {
  opportunities: OpportunityDto[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const formatPercent = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '—';
  }
  const rounded = value >= 10 || value <= -10 ? value.toFixed(1) : value.toFixed(2);
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${rounded}%`;
};

const formatUsd = (value: number) => {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return usdFormatter.format(value);
};

const capitalizeChain = (chain: string) => {
  if (!chain) return 'Unknown';
  return chain
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const FLAG_LABELS: Record<OpportunityFlagReason, string> = {
  'spread-outlier': 'Spread anomaly',
  'gas-vs-profit-outlier': 'Unrealistic gas ratio',
  'from-dex-cex-divergence': 'Source price mismatch',
  'to-dex-cex-divergence': 'Destination price mismatch'
};

const describeFlags = (reasons: OpportunityFlagReason[] | undefined): string | null => {
  if (!reasons || reasons.length === 0) {
    return null;
  }

  return reasons
    .map((reason) => FLAG_LABELS[reason] ?? reason)
    .join(', ');
};

const ArbitrageTable: React.FC<ArbitrageTableProps> = ({ opportunities, loading, error, onRefresh }) => {
  const hasData = opportunities.length > 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Arbitrage Opportunities
        </h3>
        <div className="flex gap-2 items-center">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-400 hover:text-slate-200 border border-slate-600/50 transition-all"
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-[336px] overflow-y-auto scrollbar-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Token</th>
                <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">From → To</th>
                <th className="text-right text-xs text-slate-400 font-medium py-3 px-4">Price Diff (%)</th>
                <th className="text-right text-xs text-slate-400 font-medium py-3 px-4">Trade Size</th>
                <th className="text-right text-xs text-slate-400 font-medium py-3 px-4">Gas Fee</th>
                <th className="text-right text-xs text-slate-400 font-medium py-3 px-4">Net Profit</th>
                <th className="text-right text-xs text-slate-400 font-medium py-3 px-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {hasData && opportunities.map((opportunity) => {
                const scorePercent = Math.round(opportunity.score * 100);
                const scoreClass = scorePercent >= 85
                  ? 'text-emerald-400'
                  : scorePercent >= 70
                    ? 'text-yellow-400'
                    : 'text-slate-400';

                const flagDescription = describeFlags(opportunity.flagReasons);
                const rowClassName = `border-b border-slate-800/30 ${opportunity.flagged ? 'bg-amber-500/10 border-amber-400/30' : ''}`;

                return (
                  <tr
                    key={opportunity.id}
                    className={rowClassName}
                    title={flagDescription ?? undefined}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">{opportunity.tokenSymbol}</span>
                      {opportunity.tokenName && opportunity.tokenName.toLowerCase() !== opportunity.tokenSymbol.toLowerCase() && (
                        <span className="block text-xs text-slate-400">{opportunity.tokenName}</span>
                      )}
                      {opportunity.flagged && flagDescription && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-300">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 3h.01M12 5l7 14H5l7-14z" />
                          </svg>
                          {flagDescription}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-sm">
                        {capitalizeChain(opportunity.chainFrom)} → {capitalizeChain(opportunity.chainTo)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={opportunity.priceDiffPercent && opportunity.priceDiffPercent >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                        {formatPercent(opportunity.priceDiffPercent)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {opportunity.tradeVolumeUsd !== undefined
                        ? formatUsd(opportunity.tradeVolumeUsd)
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatUsd(opportunity.gasCostUsd)}</td>
                    <td className="py-3 px-4 text-right text-cyan-400 font-medium">{formatUsd(opportunity.netProfitUsd)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${scoreClass}`}>{scorePercent}</span>
                    </td>
                  </tr>
                );
              })}
              {!loading && !hasData && (
                <tr>
                  <td className="py-6 px-4 text-center text-slate-400" colSpan={7}>
                    No opportunities available yet. Try refreshing shortly.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="py-6 px-4 text-center text-slate-400" colSpan={7}>
                    Loading opportunities…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td className="py-6 px-4 text-center text-rose-400" colSpan={7}>
                    {error}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {(hasData || loading) && (
        <p className="mt-4 text-xs text-slate-500">
          Trade size reflects the assumed USD amount used when evaluating each opportunity.
        </p>
      )}
    </div>
  );
};

export default ArbitrageTable;
