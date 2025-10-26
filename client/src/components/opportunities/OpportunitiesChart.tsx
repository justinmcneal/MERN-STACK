import { useState } from "react";

type OpportunitiesChartProps = {
  selectedTimeframe: "1h" | "24h" | "7d";
  onTimeframeChange: (timeframe: "1h" | "24h" | "7d") => void;
  selectedToken: string;
  onTokenChange: (token: string) => void;
};

const tokenOptions = ["All Tokens", "BTC", "ETH", "BNB", "MATIC", "XRP", "SOL"];

const OpportunitiesChart: React.FC<OpportunitiesChartProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  selectedToken,
  onTokenChange,
}) => {
  const [selectedTokenChart, setSelectedTokenChart] = useState("ETH");
  const activePoint = 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Token Trends
        </h3>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="xl:flex-1 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 relative">
          <div className="flex justify-end gap-2 items-center">
            {["1h", "24h", "7d"].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => onTimeframeChange(timeframe as "1h" | "24h" | "7d")}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  selectedTimeframe === timeframe
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50"
                }`}
              >
                {timeframe}
              </button>
            ))}
            <div className="relative">
              <select
                value={selectedToken}
                onChange={(event) => onTokenChange(event.target.value)}
                className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
              >
                {tokenOptions.map((token) => (
                  <option key={token} value={token} className="bg-slate-900 text-slate-300">
                    {token}
                  </option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <svg className="w-full h-full" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.0)" />
              </linearGradient>
              <linearGradient id="ethereumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
              </linearGradient>
              <linearGradient id="bscGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(251, 191, 36, 0.3)" />
                <stop offset="100%" stopColor="rgba(251, 191, 36, 0.0)" />
              </linearGradient>
            </defs>

            <path d="M 0 150 Q 100 140 200 135 T 400 130 T 600 125 T 800 120" stroke="#8b5cf6" strokeWidth="2" fill="none" />
            <path d="M 0 150 Q 100 140 200 135 T 400 130 T 600 125 T 800 120 L 800 200 L 0 200 Z" fill="url(#polygonGradient)" />

            <path d="M 0 120 Q 100 110 200 105 T 400 100 T 600 95 T 800 90" stroke="#22d3ee" strokeWidth="2" fill="none" />
            <path d="M 0 120 Q 100 110 200 105 T 400 100 T 600 95 T 800 90 L 800 200 L 0 200 Z" fill="url(#ethereumGradient)" />

            <path d="M 0 80 Q 100 70 200 75 T 400 65 T 600 60 T 800 55" stroke="#fbbf24" strokeWidth="2" fill="none" />
            <path d="M 0 80 Q 100 70 200 75 T 400 65 T 600 60 T 800 55 L 800 200 L 0 200 Z" fill="url(#bscGradient)" />

            <text x="0" y="195" fill="#64748b" fontSize="10">00:00</text>
            <text x="150" y="195" fill="#64748b" fontSize="10">00:15</text>
            <text x="300" y="195" fill="#64748b" fontSize="10">00:30</text>
            <text x="450" y="195" fill="#64748b" fontSize="10">00:45</text>
            <text x="600" y="195" fill="#64748b" fontSize="10">01:00</text>
            <text x="750" y="195" fill="#64748b" fontSize="10">01:15</text>

            <circle cx={activePoint * 16} cy={120 - activePoint * 0.5} r="4" fill="#22d3ee" className="animate-pulse" />
          </svg>

          <div className="absolute top-20 right-12 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-400">Polygon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-slate-400">Ethereum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-slate-400">Binance Smart Chain</span>
            </div>
          </div>
        </div>

        <div className="xl:w-1/3 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-sm">Ξ</span>
              </div>
              <div>
                <div className="font-semibold text-slate-200">Token: {selectedTokenChart}</div>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedTokenChart}
                onChange={(event) => setSelectedTokenChart(event.target.value)}
                className="appearance-none px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
              >
                {tokenOptions.map((token) => (
                  <option key={token} value={token} className="bg-slate-900 text-slate-300">
                    {token}
                  </option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <h4 className="text-slate-400 text-sm mb-3">Prices per Chain</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-300">Ethereum</span><span className="text-slate-200 font-medium">$3,247.85</span></div>
              <div className="flex justify-between"><span className="text-slate-300">BSC</span><span className="text-slate-200 font-medium">$3,260.12</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Polygon</span><span className="text-slate-200 font-medium">$3,245.50</span></div>
            </div>
          </div>

          <div>
            <h4 className="text-slate-400 text-sm mb-3">Gas Fee Estimation per Chain</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-300">Ethereum</span><span className="text-slate-200 font-medium">0.002 ETH</span></div>
              <div className="flex justify-between"><span className="text-slate-300">BSC</span><span className="text-slate-200 font-medium">0.001 BNB</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Polygon</span><span className="text-slate-200 font-medium">0.005 MATIC</span></div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="text-emerald-400 text-sm font-medium">ROI: 95%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesChart;
