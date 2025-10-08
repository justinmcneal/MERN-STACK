import { useState, useEffect } from "react";

interface TradingChartProps {
  compact?: boolean;
}

const TradingChart = ({ compact = false }: TradingChartProps) => {
  const [activePoint, setActivePoint] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePoint(prev => (prev + 1) % 8);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const containerHeight = compact ? "h-80 sm:h-96 lg:h-[28rem]" : "h-64 sm:h-72 lg:h-80";
  const chartHeight = compact ? "h-48 sm:h-56 lg:h-64" : "h-32 sm:h-36 lg:h-40";
  const padding = compact ? "p-4 sm:p-5" : "p-4 sm:p-6";

  return (
    <div className={`relative ${containerHeight} bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-xl sm:rounded-2xl border border-slate-700/50 ${padding} overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-purple-500/5"></div>
      
      <div className="relative z-10">
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center ${compact ? 'mb-6 sm:mb-8' : 'mb-4 sm:mb-6'} gap-2 sm:gap-0`}>
          <div>
            <h3 className={`text-cyan-200 font-semibold ${compact ? 'text-sm sm:text-base' : 'text-sm sm:text-base'}`}>ETH/USDC Arbitrage</h3>
            <p className={`text-emerald-400 ${compact ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'}`}>+12.4% ROI detected</p>
          </div>
          <div className="text-left sm:text-right">
            <div className={`font-bold text-white ${compact ? 'text-base sm:text-lg lg:text-xl' : 'text-lg sm:text-xl lg:text-2xl'}`}>$2,847.32</div>
            <div className={`text-emerald-400 ${compact ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'}`}>+$127.45 (4.7%)</div>
          </div>
        </div>

        <div className={`relative ${chartHeight}`}>
          <svg className="w-full h-full" viewBox="0 0 400 160">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
              </linearGradient>
            </defs>
            
            <path
              d="M 0 120 Q 50 100 100 90 T 200 70 T 300 50 T 400 40"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 0 120 Q 50 100 100 90 T 200 70 T 300 50 T 400 40 L 400 160 L 0 160 Z"
              fill="url(#chartGradient)"
            />
            
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle
                key={i}
                cx={i * 57}
                cy={120 - i * 10}
                r={activePoint === i ? "6" : "4"}
                fill={activePoint === i ? "#22d3ee" : "#64748b"}
                className="transition-all duration-300"
              />
            ))}
            
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Ethereum</span>
          <span>Polygon</span>
          <span>BSC</span>
          <span>Arbitrum</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
