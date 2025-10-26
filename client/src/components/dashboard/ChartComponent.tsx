import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTokenContext } from '../../context/useTokenContext';
import TokenService from '../../services/TokenService';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const ChartComponent: React.FC = () => {
  const { tokens, loading } = useTokenContext();
  const [timeframe, setTimeframe] = useState<'1h'|'24h'|'7d'>('24h');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [historyNotice, setHistoryNotice] = useState<string | null>(null);
  const historyCacheRef = useRef<Map<string, { data: number[]; message?: string; fetchedAt: number }>>(new Map());

  // Choose a token object to base the chart on: prefer selectedSymbol else first token symbol
  // When picking a token object for anchor price (for mocks), prefer the ethereum chain, then polygon, then bsc
  const baseToken = useMemo(() => {
    if (!tokens || tokens.length === 0) return null;
    // build list of symbols
    const symbols = Array.from(new Set(tokens.map(t => t.symbol)));
    const chosenSymbol = selectedSymbol || symbols[0] || tokens[0].symbol;

    // find token object for chosenSymbol preferring preferredChains order
    for (const chain of ['ethereum', 'polygon', 'bsc']) {
      const found = tokens.find(t => t.symbol.toLowerCase() === chosenSymbol.toLowerCase() && t.chain.toLowerCase() === chain);
      if (found) return found;
    }

    // fallback to any token with the symbol
    const anyFound = tokens.find(t => t.symbol.toLowerCase() === chosenSymbol.toLowerCase());
    if (anyFound) return anyFound;

    return tokens[0];
  }, [tokens, selectedSymbol]);

  // Number of points per timeframe
  const pointsCount = timeframe === '1h' ? 12 : timeframe === '24h' ? 24 : 7 * 12; // 7d -> 84 points

  const [seriesByChain, setSeriesByChain] = useState<Record<string, number[]>>({});

  // Try to fetch real history from server; if unavailable show notice
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!baseToken) {
        setSeriesByChain({});
        setHistoryNotice('Select a token to view historical pricing.');
        return;
      }

      const chains = ['polygon', 'ethereum', 'bsc'];
      const tfParam = timeframe === '1h' ? '24h' : timeframe === '24h' ? '24h' : '7d';
      const results: Record<string, number[]> = {};
      let hasData = false;
      let notice: string | null = null;

      await Promise.all(chains.map(async (chain) => {
        const cacheKey = `${baseToken.symbol.toUpperCase()}::${chain}::${tfParam}`;
        const now = Date.now();
        const cached = historyCacheRef.current.get(cacheKey);

        if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
          if (cached.data.length > 0) {
            results[chain] = cached.data;
            hasData = true;
          } else if (cached.message && !notice) {
            notice = cached.message;
          }
          return;
        }

        try {
          const resp = await TokenService.history(baseToken.symbol, chain, tfParam);
          const data = resp?.data || [];
          if (Array.isArray(data) && data.length > 0) {
            const prices = data.map((p: { price: number | string }) => Number(p.price));
            let processed = prices;
            if (prices.length > pointsCount) {
              const step = Math.floor(prices.length / pointsCount) || 1;
              const sampled: number[] = [];
              for (let i = 0; i < prices.length; i += step) {
                sampled.push(prices[i]);
                if (sampled.length >= pointsCount) break;
              }
              processed = sampled;
            }
            results[chain] = processed;
            hasData = true;
            historyCacheRef.current.set(cacheKey, { data: processed, fetchedAt: Date.now() });
            return;
          }

          const message = resp?.message as string | undefined;
          if (message && !notice) {
            notice = message;
          }
          historyCacheRef.current.set(cacheKey, { data: [], message, fetchedAt: Date.now() });
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          const message = err?.response?.data?.message || 'Historical price data is not available yet. Real-time pricing will continue to refresh normally.';
          if (!notice) {
            notice = message;
          }
          historyCacheRef.current.set(cacheKey, { data: [], message, fetchedAt: Date.now() });
        }
      }));

      if (!mounted) return;

      if (hasData) {
        setSeriesByChain(results);
        setHistoryNotice(null);
      } else {
        setSeriesByChain({});
        setHistoryNotice(
          notice || 'Historical price data is not available yet. Real-time pricing will continue to refresh normally.'
        );
      }
    };
    fetchHistory();
    return () => { mounted = false; };
  }, [baseToken, timeframe, pointsCount]);

  // Chart drawing params
  const width = 800;
  const height = 200;
  const padding = 20;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Helper to build path/area and min/max for a numeric series
  const buildPathForSeries = (s: number[]) => {
    if (!s || s.length === 0) return { pathD: '', areaD: '', minP: 0, maxP: 0 };
    const min = Math.min(...s);
    const max = Math.max(...s);
    const range = Math.max(1e-8, max - min);
    const points = s.map((v, i) => {
      const x = padding + (i / (s.length - 1)) * innerW;
      const y = padding + innerH - ((v - min) / range) * innerH;
      return { x, y };
    });
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const last = points[points.length - 1];
    const first = points[0];
    const area = `${path} L ${last.x.toFixed(2)} ${padding + innerH} L ${first.x.toFixed(2)} ${padding + innerH} Z`;
    return { pathD: path, areaD: area, minP: min, maxP: max };
  };

  const colorByChain = (chain?: string) => {
    if (!chain) return '#8b5cf6';
    if (chain.toLowerCase().includes('eth')) return '#22d3ee';
    if (chain.toLowerCase().includes('bsc')) return '#fbbf24';
    if (chain.toLowerCase().includes('polygon') || chain.toLowerCase().includes('matic')) return '#a78bfa';
    return '#8b5cf6';
  };

  const selectedChain = baseToken?.chain;

  // Combined series for scale/labels (merge all available chains)
  const combinedSeries = useMemo(() => {
    const all = Object.values(seriesByChain).flat();
    return all.length > 0 ? all : [];
  }, [seriesByChain]);

  const { minP: combinedMin, maxP: combinedMax } = useMemo(() => {
    if (!combinedSeries || combinedSeries.length === 0) return { minP: 0, maxP: 0 };
    return { minP: Math.min(...combinedSeries), maxP: Math.max(...combinedSeries) };
  }, [combinedSeries]);

  const hasSeries = combinedSeries.length > 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>Token Trends
        </h3>
        <div className="flex gap-2 items-center">
          {(['1h','24h','7d'] as const).map(tf=> (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 text-xs rounded-lg transition-all ${timeframe===tf? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50`}>{tf}</button>
          ))}
          <div className="relative">
            <select value={selectedSymbol || (baseToken?.symbol ?? '')} onChange={(e) => setSelectedSymbol(e.target.value)} className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300">
              <option value="">Select token</option>
              {(!loading ? Array.from(new Set(tokens.map(t => t.symbol))).map(sym => (
                <option key={sym} value={sym} className="bg-slate-900 text-slate-300">{sym}</option>
              )) : [])}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      {/* Use a responsive container that preserves the chart aspect ratio */}
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}`, width: '100%' }}>
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`areaGrad-${baseToken?.symbol || 'g'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorByChain(selectedChain)} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colorByChain(selectedChain)} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* per-chain areas and lines */}
          {['polygon','ethereum','bsc'].map(chain => {
            const s = seriesByChain[chain] || [];
            const { pathD, areaD } = buildPathForSeries(s);
            const gradId = `areaGrad-${baseToken?.symbol || 'g'}-${chain}`;
            return (
              <g key={chain}>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colorByChain(chain)} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={colorByChain(chain)} stopOpacity="0" />
                </linearGradient>
                {areaD && <path d={areaD} fill={`url(#${gradId})`} stroke="none" />}
                {pathD && <path d={pathD} stroke={colorByChain(chain)} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={chain===selectedChain ? 1 : 0.65} />}
              </g>
            );
          })}

          {/* x labels (based on combined series length or default pointsCount) */}
          {(() => {
            const len = combinedSeries.length > 0 ? combinedSeries.length : pointsCount;
            return Array.from({ length: len }).map((_, i) => {
              const x = padding + (i / (len - 1)) * innerW;
              if (i % Math.ceil(len / 6) !== 0) return null;
              const label = (() => {
                if (timeframe === '1h') return `${Math.max(0, 60 - Math.round(i * (60 / len)))}m`;
                if (timeframe === '24h') return `${Math.max(0, 24 - Math.round(i * (24 / len)))}h`;
                return `${Math.max(0, 7 - Math.round(i * (7 / len)))}d`;
              })();
              return <text key={i} x={x} y={height - 6} fill="#64748b" fontSize="10" textAnchor="middle">{label}</text>;
            });
          })()}

          {/* y labels based on combined min/max */}
          {hasSeries && [0,0.25,0.5,0.75,1].map((f, idx) => {
            const val = combinedMin + (1 - f) * (combinedMax - combinedMin || 1);
            const y = padding + innerH * f;
            return <text key={idx} x={6} y={y+3} fill="#64748b" fontSize="10">{`$${Number(val).toLocaleString(undefined, {maximumFractionDigits:2})}`}</text>;
          })}
        </svg>
        {!hasSeries && historyNotice && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="text-sm text-slate-400">{historyNotice}</p>
          </div>
        )}
      </div>

      {/* Legend moved outside the SVG to avoid overlap and ensure responsive layout */}
      <div className="mt-4 flex flex-wrap gap-6 text-xs items-center">
        <div className="flex items-center gap-2">
          <div style={{width:12,height:12,borderRadius:6,background:colorByChain('polygon')}}></div>
          <span className="text-slate-400">Polygon</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{width:12,height:12,borderRadius:6,background:colorByChain('ethereum')}}></div>
          <span className="text-slate-400">Ethereum</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{width:12,height:12,borderRadius:6,background:colorByChain('bsc')}}></div>
          <span className="text-slate-400">Binance Smart Chain</span>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
