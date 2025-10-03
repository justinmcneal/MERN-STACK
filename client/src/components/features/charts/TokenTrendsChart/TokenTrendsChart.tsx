import React, { useState, useEffect } from "react";

interface TokenTrendsChartProps {
  title?: string;
  selectedTimeframe?: string;
  selectedToken?: string;
  onTimeframeChange?: (timeframe: string) => void;
  onTokenChange?: (token: string) => void;
  className?: string;
}

const TokenTrendsChart: React.FC<TokenTrendsChartProps> = ({
  title = "Token Trends",
  selectedTimeframe = "1h",
  selectedToken = "Select token",
  onTimeframeChange,
  onTokenChange,
  className = ""
}) => {
  const [activeChart, setActiveChart] = useState(0);

  useEffect(() => { 
    const i = setInterval(() => setActiveChart(p => (p+1)%50), 100); 
    return () => clearInterval(i); 
  }, []);

  const timeframes = ["1h", "24h", "7d"];
  const tokens = ["Select token", "BTC", "ETH", "BNB", "MATIC", "USDT"];

  return (
    <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      {/* Header: Token Trends + Timeframes + Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          {title}
        </h3>
        <div className="flex gap-2 items-center">
          {timeframes.map(tf => (
            <button 
              key={tf} 
              onClick={() => onTimeframeChange?.(tf)}
              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                selectedTimeframe === tf 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                  : "bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50"
              }`}
            >
              {tf}
            </button>
          ))}
          <div className="relative">
            <select 
              value={selectedToken} 
              onChange={e => onTokenChange?.(e.target.value)}
              className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
            >
              {tokens.map(t => 
                <option key={t} value={t} className="bg-slate-900 text-slate-300">
                  {t}
                </option>
              )}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Line Graph */}
      <div className="h-64 bg-slate-900/30 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
          {Array.from({length: 50}, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div 
                className={`w-1 rounded-t transition-all duration-300 ${
                  i === activeChart 
                    ? 'bg-gradient-to-t from-cyan-500 to-purple-500 h-16' 
                    : i > activeChart 
                    ? 'bg-slate-600 h-8' 
                    : 'bg-slate-700 h-4'
                }`}
              />
              {i % 10 === 0 && (
                <span className="text-xs text-slate-500 mt-2">
                  {new Date(Date.now() - (49-i) * 60000).toLocaleTimeString([], {
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenTrendsChart;
