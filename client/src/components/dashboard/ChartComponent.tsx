import React, { useMemo, useState } from 'react';
import { useTokenContext } from '../../context/useTokenContext';

const ChartComponent: React.FC = () => {
  const { tokens, loading } = useTokenContext();
  const [timeframe, setTimeframe] = useState<'1h'|'24h'|'7d'>('24h');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');

  // Helper: deterministic PRNG based on seed string
  const seedFromString = (s: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  };
  const mulberry32 = (a: number) => () => {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // Choose a token object to base the chart on: prefer selectedSymbol else first token
  const baseToken = useMemo(() => {
    if (!tokens || tokens.length === 0) return null;
    if (selectedSymbol) return tokens.find(t => t.symbol.toLowerCase() === selectedSymbol.toLowerCase()) || tokens[0];
    return tokens[0];
  }, [tokens, selectedSymbol]);

  // Number of points per timeframe
  const pointsCount = timeframe === '1h' ? 12 : timeframe === '24h' ? 24 : 7 * 12; // 7d -> 84 points

  // Generate deterministic mock series around currentPrice
  const series = useMemo(() => {
    if (!baseToken) return [] as number[];
    const startPrice = Number(baseToken.currentPrice) || 1;
    const seed = seedFromString(`${baseToken.symbol}-${baseToken.chain}-${timeframe}`);
    const rand = mulberry32(seed);
    const volatility = timeframe === '1h' ? 0.004 : timeframe === '24h' ? 0.01 : 0.03;
    const vals: number[] = [startPrice];
    for (let i = 1; i < pointsCount; i++) {
      const pct = (rand() - 0.5) * 2 * volatility; // between -vol..+vol
      const next = Math.max(0.0000001, vals[i-1] * (1 + pct));
      vals.push(next);
    }
    return vals;
  }, [baseToken, timeframe, pointsCount]);

  // Chart drawing params
  const width = 800;
  const height = 200;
  const padding = 20;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Build path from series
  const { pathD, areaD, minP, maxP } = useMemo(() => {
    if (!series || series.length === 0) return { pathD: '', areaD: '', minP: 0, maxP: 0 };
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = Math.max(1e-8, max - min);
    const points = series.map((v, i) => {
      const x = padding + (i / (series.length - 1)) * innerW;
      const y = padding + innerH - ((v - min) / range) * innerH;
      return { x, y };
    });
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const last = points[points.length - 1];
    const first = points[0];
    const area = `${path} L ${last.x.toFixed(2)} ${padding + innerH} L ${first.x.toFixed(2)} ${padding + innerH} Z`;
    return { pathD: path, areaD: area, minP: min, maxP: max };
  }, [series, innerW, innerH, padding]);

  const colorByChain = (chain?: string) => {
    if (!chain) return '#8b5cf6';
    if (chain.toLowerCase().includes('eth')) return '#22d3ee';
    if (chain.toLowerCase().includes('bsc')) return '#fbbf24';
    if (chain.toLowerCase().includes('polygon') || chain.toLowerCase().includes('matic')) return '#a78bfa';
    return '#8b5cf6';
  };

  const selectedChain = baseToken?.chain;

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
              {(!loading ? tokens : []).map(t=> <option key={`${t.symbol}-${t.chain}`} value={t.symbol} className="bg-slate-900 text-slate-300">{`${t.symbol} • ${t.chain}`}</option>)}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`areaGrad-${baseToken?.symbol || 'g'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorByChain(selectedChain)} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colorByChain(selectedChain)} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* area */}
          {areaD && <path d={areaD} fill={`url(#areaGrad-${baseToken?.symbol || 'g'})`} stroke="none" />}
          {/* line */}
          {pathD && <path d={pathD} stroke={colorByChain(selectedChain)} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />}

          {/* x labels */}
          {series && series.length > 0 && series.map((_, i) => {
            const x = padding + (i / (series.length - 1)) * innerW;
            if (i % Math.ceil(series.length / 6) !== 0) return null;
            const label = (() => {
              if (timeframe === '1h') return `${Math.max(0, 60 - Math.round(i * (60 / series.length)))}m`;
              if (timeframe === '24h') return `${Math.max(0, 24 - Math.round(i * (24 / series.length)))}h`;
              return `${Math.max(0, 7 - Math.round(i * (7 / series.length)))}d`;
            })();
            return <text key={i} x={x} y={height - 6} fill="#64748b" fontSize="10" textAnchor="middle">{label}</text>;
          })}

          {/* y labels */}
          {series && series.length > 0 && [0,0.25,0.5,0.75,1].map((f, idx) => {
            const val = minP + (1 - f) * (maxP - minP);
            const y = padding + innerH * f;
            return <text key={idx} x={6} y={y+3} fill="#64748b" fontSize="10">{`$${Number(val).toLocaleString(undefined, {maximumFractionDigits:2})}`}</text>;
          })}
        </svg>

        <div className="absolute bottom-4 right-4 flex gap-6 text-xs mb-56 mr-20">
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
    </div>
  );
};

export default ChartComponent;
