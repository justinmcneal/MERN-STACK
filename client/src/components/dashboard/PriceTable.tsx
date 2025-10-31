import React, { useMemo, useState } from 'react';
import { useTokenContext } from '../../context/useTokenContext';
import type {
  CurrencyFormatterFn,
  SupportedCurrency,
  UsdConverterFn
} from '../../hooks/useCurrencyFormatter';

type Props = {
  filterMode: 'all' | 'byChain' | 'byToken';
  selectedChain: string | null;
  onSelectChain: (c: string | null) => void;
  selectedToken: string;
  onSelectToken: (t: string) => void;
  currency: SupportedCurrency;
  formatCurrency: CurrencyFormatterFn;
  convertFromUsd: UsdConverterFn;
};

const PriceTable: React.FC<Props> = ({
  filterMode,
  selectedChain,
  onSelectChain,
  selectedToken,
  onSelectToken,
  currency,
  formatCurrency,
  convertFromUsd
}) => {
  const { tokens, loading, error, refresh, isRefreshing } = useTokenContext();

  type SortKey = 'symbol' | 'chain' | 'currentPrice' | 'dexPrice' | 'spread' | 'liquidity' | 'lastUpdated';
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const STALE_THRESHOLD_MS = 90 * 60 * 1000; // 90 minutes

  const formatPriceValue = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    const converted = convertFromUsd(value);
    if (converted === null) return '—';
    const absVal = Math.abs(converted);

    if (absVal >= 1000) {
      return formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    if (absVal >= 1) {
      return formatCurrency(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return formatCurrency(value, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    return `${value > 0 ? '+' : ''}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  const formatLiquidity = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    const converted = convertFromUsd(value);
    if (converted === null) return '—';
    const absVal = Math.abs(converted);

    if (absVal >= 1_000) {
      return formatCurrency(value, { notation: 'compact', maximumFractionDigits: 1 });
    }

    return formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  type TimestampMeta = { display: string; isStale: boolean; absolute?: string };

  const formatTimestamp = (iso?: string): TimestampMeta => {
    if (!iso) return { display: '—', isStale: false };
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return { display: '—', isStale: false };
    }
    const diff = Date.now() - parsed.getTime();
    const isStale = diff > STALE_THRESHOLD_MS;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let relative = 'just now';
    if (minutes >= 1 && minutes < 60) {
      relative = `${minutes}m ago`;
    } else if (hours >= 1 && hours < 48) {
      relative = `${hours}h ago`;
    } else if (days >= 1) {
      relative = `${days}d ago`;
    }

    return {
      display: `${relative}`,
      isStale,
      absolute: parsed.toLocaleString()
    };
  };

  const chains = useMemo(
    () => Array.from(new Set(tokens.map(t => t.chain))).sort((a, b) => a.localeCompare(b)),
    [tokens]
  );
  const tokenSymbols = useMemo(() => {
    // Exclude stablecoins from token selector
    const EXCLUDED_STABLECOINS = ['USDT', 'USDC', 'DAI', 'BUSD'];
    return Array.from(
      new Set(
        tokens
          .filter(t => !EXCLUDED_STABLECOINS.includes(t.symbol.toUpperCase()))
          .map(t => t.symbol)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [tokens]);

  const filtered = useMemo(() => {
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
  }, [tokens, filterMode, selectedChain, selectedToken]);

  const sorted = useMemo(() => {
    const list = [...filtered];

    const getComparableValue = (token: typeof filtered[number]) => {
      switch (sortKey) {
        case 'symbol':
          return token.symbol.toLowerCase();
        case 'chain':
          return token.chain.toLowerCase();
        case 'currentPrice':
          return token.currentPrice ?? 0;
        case 'dexPrice':
          return token.dexPrice ?? Number.NEGATIVE_INFINITY;
        case 'liquidity':
          return token.liquidity ?? Number.NEGATIVE_INFINITY;
        case 'lastUpdated': {
          const ts = token.lastUpdated ? new Date(token.lastUpdated).getTime() : 0;
          return Number.isNaN(ts) ? 0 : ts;
        }
        case 'spread': {
          const base = token.currentPrice ?? null;
          const dex = token.dexPrice ?? null;
          if (base && dex) {
            return ((dex - base) / base) * 100;
          }
          return Number.NEGATIVE_INFINITY;
        }
        default:
          return 0;
      }
    };

    list.sort((a, b) => {
      const valueA = getComparableValue(a);
      const valueB = getComparableValue(b);

      if (valueA === valueB) {
        return a.symbol.localeCompare(b.symbol) || a.chain.localeCompare(b.chain);
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const numA = Number(valueA);
      const numB = Number(valueB);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return list;
  }, [filtered, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection(key === 'lastUpdated' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    onSelectChain(null);
    onSelectToken('');
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:gap-4">
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

        <div className="flex items-center gap-2 md:ml-auto">
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700/60 border border-slate-600/50"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className={`px-3 py-1 text-xs rounded-lg border border-slate-600/50 transition-colors ${isRefreshing ? 'bg-cyan-500/20 text-cyan-300 cursor-wait' : 'bg-cyan-600/20 text-cyan-200 hover:bg-cyan-500/30'}`}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="max-h-[336px] overflow-y-auto scrollbar-white">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-xs text-slate-400">
                {[
                  { label: 'Token', key: 'symbol' as SortKey },
                  { label: 'Chain', key: 'chain' as SortKey },
                  { label: `Price (Feed) (${currency})`, key: 'currentPrice' as SortKey },
                  { label: `Price (DEX) (${currency})`, key: 'dexPrice' as SortKey },
                  { label: 'Spread', key: 'spread' as SortKey },
                  { label: `Liquidity (${currency})`, key: 'liquidity' as SortKey },
                  { label: 'Last Updated', key: 'lastUpdated' as SortKey }
                ].map(({ label, key }) => {
                  const isActive = sortKey === key;
                  const directionIndicator = isActive ? (sortDirection === 'asc' ? '▲' : '▼') : '';
                  const alignRight = ['currentPrice', 'dexPrice', 'spread', 'liquidity', 'lastUpdated'].includes(key);

                  return (
                    <th
                      key={key}
                      className={`py-3 px-4 font-medium ${alignRight ? 'text-right' : 'text-left'}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(key)}
                        className={`flex items-center gap-1 text-xs uppercase tracking-wider ${isActive ? 'text-cyan-300' : 'text-slate-400'} hover:text-cyan-200 ${alignRight ? 'ml-auto' : ''}`}
                      >
                        <span>{label}</span>
                        {directionIndicator && <span>{directionIndicator}</span>}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-slate-400">Loading token prices…</td>
                </tr>
              )}

              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-slate-400">
                    No tokens match the current filters.
                  </td>
                </tr>
              )}

              {!loading && sorted.map((token) => {
                const spreadValue = token.dexPrice && token.currentPrice
                  ? ((token.dexPrice - token.currentPrice) / token.currentPrice) * 100
                  : null;
                const timestampMeta = formatTimestamp(token.lastUpdated);
                const isStale = timestampMeta.isStale;
                const rowKey = token._id ?? `${token.symbol}-${token.chain}`;

                return (
                  <tr
                    key={rowKey}
                    className={`border-b border-slate-800/40 text-sm transition-colors ${isStale ? 'bg-slate-800/30' : 'hover:bg-slate-800/20'}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{token.symbol}</span>
                        {token.name && token.name.toLowerCase() !== token.symbol.toLowerCase() && (
                          <span className="text-xs text-slate-500">{token.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${token.chain === 'ethereum'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : token.chain === 'bsc'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>{token.chain}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">{formatPriceValue(token.currentPrice)}</td>
                    <td className="py-3 px-4 text-right text-slate-200">
                      <div className="flex flex-col items-end gap-1">
                        <span>{formatPriceValue(token.dexPrice)}</span>
                        {token.dexName && <span className="text-[10px] uppercase tracking-wide text-slate-500">{token.dexName}</span>}
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right ${spreadValue === null ? 'text-slate-400' : spreadValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatPercent(spreadValue ?? undefined)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">{formatLiquidity(token.liquidity)}</td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      <div className="flex flex-col items-end gap-1">
                        <span title={timestampMeta.absolute}>{timestampMeta.display}</span>
                        {isStale && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                            Stale
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceTable;
