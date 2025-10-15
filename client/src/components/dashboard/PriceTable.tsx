import React, { useMemo } from 'react';
import { useTokenContext } from '../../context/useTokenContext';

type Props = {
  filterMode: 'all' | 'byChain' | 'byToken';
  selectedChain: string | null;
  onSelectChain: (c: string | null) => void;
  selectedToken: string;
  onSelectToken: (t: string) => void;
};

const PriceTable: React.FC<Props> = ({ filterMode, selectedChain, onSelectChain, selectedToken, onSelectToken }) => {
  const { tokens, loading } = useTokenContext();

  // derive unique chains and tokens for selectors
  const chains = useMemo(() => Array.from(new Set(tokens.map(t => t.chain))), [tokens]);
  const tokenSymbols = useMemo(() => Array.from(new Set(tokens.map(t => t.symbol))), [tokens]);

  const filtered = useMemo(() => {
    if (loading) return [];
    if (filterMode === 'all') return tokens;
    if (filterMode === 'byChain') {
      if (!selectedChain) return tokens;
      return tokens.filter(t => t.chain === selectedChain);
    }
    if (filterMode === 'byToken') {
      if (!selectedToken) return tokens;
      return tokens.filter(t => t.symbol.toLowerCase() === selectedToken.toLowerCase());
    }
    return tokens;
  }, [tokens, loading, filterMode, selectedChain, selectedToken]);

  const clearFilters = () => {
    onSelectChain(null);
    onSelectToken('');
  };

  return (
    <div>
      {/* Filter controls (these are visualized in main_dashboard as buttons, but table also provides selectors) */}
      <div className="flex items-center gap-3 mb-3">
        {filterMode === 'byChain' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Chain</label>
            <select value={selectedChain ?? ''} onChange={(e) => onSelectChain(e.target.value || null)} className="bg-slate-800/60 border border-slate-700/50 text-sm rounded-lg px-3 py-1 text-slate-200">
              <option value="">All Chains</option>
              {chains.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
            </select>
          </div>
        )}
        {filterMode === 'byToken' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Token</label>
            <select value={selectedToken} onChange={(e) => onSelectToken(e.target.value)} className="bg-slate-800/60 border border-slate-700/50 text-sm rounded-lg px-3 py-1 text-slate-200">
              <option value="">All Tokens</option>
              {tokenSymbols.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
            </select>
          </div>
        )}

        <button onClick={clearFilters} className="ml-auto px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700/60 border border-slate-600/50">Clear Filters</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {['Token', 'Chain', 'Current Price', 'Last Updated'].map((h, i) => (
                <th key={i} className="text-left text-xs text-slate-400 font-medium pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-2">
            {loading && <tr><td>Loading...</td></tr>}
            {!loading && filtered.map((t, i) => (
              <tr key={`${t.symbol}-${t.chain}-${i}`} className="border-b border-slate-800/30">
                <td className="py-3"><span className="font-medium text-slate-200">{t.symbol}</span></td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${t.chain === 'ethereum' ? 'bg-cyan-500/20 text-cyan-400' : t.chain === 'bsc' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{t.chain}</span>
                </td>
                <td className="py-3 text-right text-slate-200">${Number(t.currentPrice).toLocaleString()}</td>
                <td className="py-3 text-right text-xs text-slate-400">{new Date(t.lastUpdated).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceTable;
