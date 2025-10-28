import React, { useMemo, useState, useEffect, useRef } from 'react';
import TokenService from '../../services/TokenService';
import type { TokenDto } from '../../services/TokenService';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface OpportunityData {
  tokenSymbol: string;
  chainFrom: string;
  chainTo: string;
  priceFrom?: number;
  priceTo?: number;
  priceDiffPercent?: number;
  roi?: number | null;
  netProfitUsd: number;
  gasCostUsd: number;
}

type OpportunitiesChartProps = {
  selectedTimeframe: "1h" | "24h" | "7d";
  onTimeframeChange: (timeframe: "1h" | "24h" | "7d") => void;
  selectedToken: string;
  onTokenChange: (token: string) => void;
  opportunities?: OpportunityData[];
};

const OpportunitiesChart: React.FC<OpportunitiesChartProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  opportunities = [],
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [tokenPrices, setTokenPrices] = useState<Record<string, Record<string, number>>>({});
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityData | null>(null);
  const [historyNotice, setHistoryNotice] = useState<string | null>(null);
  const historyCacheRef = useRef<Map<string, { data: number[]; message?: string; fetchedAt: number }>>(new Map());

  // Extract unique tokens from opportunities
  const availableTokens = useMemo(() => 
    Array.from(new Set(opportunities.map(opp => opp.tokenSymbol))).sort()
  , [opportunities]);

  // Select first available token if none selected
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedSymbol) {
      setSelectedSymbol(availableTokens[0]);
    }
  }, [availableTokens, selectedSymbol]);

  // Get opportunities for selected token
  const tokenOpportunities = useMemo(() => 
    opportunities.filter(opp => opp.tokenSymbol === selectedSymbol)
  , [opportunities, selectedSymbol]);

  // Set selected opportunity
  useEffect(() => {
    if (tokenOpportunities.length > 0) {
      setSelectedOpportunity(tokenOpportunities[0]);
    } else {
      setSelectedOpportunity(null);
    }
  }, [tokenOpportunities]);

  // Fetch real token prices from database
  useEffect(() => {
    const fetchPriceData = async () => {
      if (!selectedSymbol) return;
      
      try {
        const result = await TokenService.listTokens({ symbol: selectedSymbol });
        if (Array.isArray(result)) {
          const pricesByChain: Record<string, number> = {};
          result.forEach((token: TokenDto) => {
            if (token.chain && token.currentPrice) {
              const chainName = token.chain.charAt(0).toUpperCase() + token.chain.slice(1);
              pricesByChain[chainName] = token.currentPrice;
            }
          });
          if (Object.keys(pricesByChain).length > 0) {
            setTokenPrices(prev => ({
              ...prev,
              [selectedSymbol]: pricesByChain
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
      }
    };

    fetchPriceData();
  }, [selectedSymbol]);

  // Number of points per timeframe
  const pointsCount = selectedTimeframe === '1h' ? 12 : selectedTimeframe === '24h' ? 24 : 7 * 12;

  const [seriesByChain, setSeriesByChain] = useState<Record<string, number[]>>({});

  // Fetch real historical data from server
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!selectedSymbol) {
        setSeriesByChain({});
        setHistoryNotice('Select a token to view historical pricing.');
        return;
      }

      const chains = ['polygon', 'ethereum', 'bsc'];
      const tfParam = selectedTimeframe === '1h' ? '24h' : selectedTimeframe === '24h' ? '24h' : '7d';
      const results: Record<string, number[]> = {};
      let hasData = false;
      let notice: string | null = null;

      await Promise.all(chains.map(async (chain) => {
        const cacheKey = `${selectedSymbol.toUpperCase()}::${chain}::${tfParam}`;
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
          const resp = await TokenService.history(selectedSymbol, chain, tfParam);
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
          const message = err?.response?.data?.message || 'Historical price data is not available yet.';
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
        setHistoryNotice(notice || 'Historical price data is not available yet.');
      }
    };
    fetchHistory();
    return () => { mounted = false; };
  }, [selectedSymbol, selectedTimeframe, pointsCount]);

  // Chart drawing params
  const width = 1200;
  const height = 320;
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Build path for a series
  const buildPathForSeries = (s: number[], globalMin?: number, globalMax?: number) => {
    if (!s || s.length === 0) return { pathD: '', areaD: '', minP: 0, maxP: 0 };
    
    const min = globalMin !== undefined ? globalMin : Math.min(...s);
    const max = globalMax !== undefined ? globalMax : Math.max(...s);
    const range = Math.max(1e-8, max - min);
    
    const points = s.map((v, i) => {
      const x = padding + (i / Math.max(1, s.length - 1)) * innerW;
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

  const capitalizeChain = (chain: string): string => {
    return chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase();
  };

  // Combined series for scale
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
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Token Trends
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {(['1h','24h','7d'] as const).map(tf => (
            <button 
              key={tf} 
              onClick={() => onTimeframeChange(tf)} 
              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                selectedTimeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50'
              }`}
            >
              {tf}
            </button>
          ))}
          <div className="relative min-w-[140px]">
            <select 
              value={selectedSymbol} 
              onChange={(e) => setSelectedSymbol(e.target.value)} 
              className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
            >
              {availableTokens.length > 0 ? (
                availableTokens.map(token => (
                  <option key={token} value={token} className="bg-slate-900 text-slate-300">{token}</option>
                ))
              ) : (
                <option disabled className="bg-slate-900 text-slate-300">No tokens</option>
              )}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Chart Section */}
        <div className="xl:flex-1 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 relative">
          <div className="relative w-full h-[360px]">
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id={`areaGrad-${selectedSymbol || 'g'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colorByChain('ethereum')} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={colorByChain('ethereum')} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Per-chain areas and lines */}
              {['polygon','ethereum','bsc'].map(chain => {
                const s = seriesByChain[chain] || [];
                if (s.length === 0) return null;
                
                const { pathD, areaD } = buildPathForSeries(s, combinedMin, combinedMax);
                const gradId = `areaGrad-${selectedSymbol || 'g'}-${chain}`;
                const chainColor = colorByChain(chain);
                
                return (
                  <g key={chain}>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={chainColor} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={chainColor} stopOpacity="0" />
                    </linearGradient>
                    {areaD && <path d={areaD} fill={`url(#${gradId})`} stroke="none" />}
                    {pathD && (
                      <path 
                        d={pathD} 
                        stroke={chainColor} 
                        strokeWidth={2} 
                        fill="none" 
                        strokeLinejoin="round" 
                        strokeLinecap="round" 
                        opacity={0.9} 
                      />
                    )}
                  </g>
                );
              })}

              {/* X labels */}
              {(() => {
                const len = combinedSeries.length > 0 ? combinedSeries.length : pointsCount;
                return Array.from({ length: len }).map((_, i) => {
                  const x = padding + (i / (len - 1)) * innerW;
                  if (i % Math.ceil(len / 6) !== 0) return null;
                  const label = (() => {
                    if (selectedTimeframe === '1h') return `${Math.max(0, 60 - Math.round(i * (60 / len)))}m`;
                    if (selectedTimeframe === '24h') return `${Math.max(0, 24 - Math.round(i * (24 / len)))}h`;
                    return `${Math.max(0, 7 - Math.round(i * (7 / len)))}d`;
                  })();
                  return <text key={i} x={x} y={height - 6} fill="#64748b" fontSize="10" textAnchor="middle">{label}</text>;
                });
              })()}

              {/* Y labels */}
              {hasSeries && [0,0.25,0.5,0.75,1].map((f, idx) => {
                const val = combinedMin + (1 - f) * (combinedMax - combinedMin || 1);
                const y = padding + innerH * f;
                return (
                  <text key={idx} x={6} y={y+3} fill="#64748b" fontSize="10">
                    ${val.toFixed(2)}
                  </text>
                );
              })}
            </svg>
            {!hasSeries && historyNotice && (
              <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                <p className="text-sm text-slate-400">{historyNotice}</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 lg:gap-6 text-xs items-center justify-center lg:justify-start pt-4 border-t border-slate-700/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorByChain('polygon') }}></div>
              <span className="text-slate-400">Polygon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorByChain('ethereum') }}></div>
              <span className="text-slate-400">Ethereum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorByChain('bsc') }}></div>
              <span className="text-slate-400">Binance Smart Chain</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="xl:w-1/3 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-sm">Ξ</span>
              </div>
              <div>
                <div className="font-semibold text-slate-200">Token: {selectedSymbol || 'Select'}</div>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="appearance-none px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
              >
                {availableTokens.length > 0 ? (
                  availableTokens.map(token => (
                    <option key={token} value={token} className="bg-slate-900 text-slate-300">{token}</option>
                  ))
                ) : (
                  <option disabled className="bg-slate-900 text-slate-300">No tokens</option>
                )}
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <h4 className="text-slate-400 text-sm mb-3">Prices per Chain</h4>
            <div className="space-y-2">
              {tokenPrices[selectedSymbol] && Object.keys(tokenPrices[selectedSymbol]).length > 0 ? (
                Object.entries(tokenPrices[selectedSymbol]).map(([chain, price]) => (
                  <div key={chain} className="flex justify-between">
                    <span className="text-slate-300">{chain}</span>
                    <span className="text-slate-200 font-medium">${price.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-center py-4">
                  <span className="text-slate-400 text-xs">Fetching prices...</span>
                </div>
              )}
            </div>
          </div>

          {selectedOpportunity ? (
            <>
              <div>
                <h4 className="text-slate-400 text-sm mb-3">Best Arbitrage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{capitalizeChain(selectedOpportunity.chainFrom)}</span>
                    <span className="text-slate-200 font-medium">${selectedOpportunity.priceFrom?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">{capitalizeChain(selectedOpportunity.chainTo)}</span>
                    <span className="text-slate-200 font-medium">${selectedOpportunity.priceTo?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <div className="text-emerald-400 text-sm font-medium">ROI: {selectedOpportunity.roi?.toFixed(1) || '0'}%</div>
                <div className="text-emerald-400/80 text-xs mt-1">Profit: ${selectedOpportunity.netProfitUsd.toFixed(2)}</div>
                <div className="text-emerald-400/80 text-xs">Price Diff: {selectedOpportunity.priceDiffPercent?.toFixed(2) || '0'}%</div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400 text-xs">No opportunity data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesChart;
