type OpportunitiesFiltersProps = {
  selectedToken: string;
  onTokenChange: (value: string) => void;
  selectedChainPair: string;
  onChainPairChange: (value: string) => void;
  minProfit: number;
  onMinProfitChange: (value: number) => void;
  tokenOptions: string[];
  chainOptions: string[];
  onReset: () => void;
};

const OpportunitiesFilters: React.FC<OpportunitiesFiltersProps> = ({
  selectedToken,
  onTokenChange,
  selectedChainPair,
  onChainPairChange,
  minProfit,
  onMinProfitChange,
  tokenOptions,
  chainOptions,
  onReset,
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-200">Filter Opportunities</h3>
        <button
          onClick={onReset}
          className="ml-auto px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300 hover:bg-slate-600/50 transition-all"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Filter by Token</label>
          <select
            value={selectedToken}
            onChange={(event) => onTokenChange(event.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            {tokenOptions.map((option) => (
              <option key={option} value={option} className="bg-slate-900 text-slate-300">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Filter by Chain Pair</label>
          <select
            value={selectedChainPair}
            onChange={(event) => onChainPairChange(event.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            {chainOptions.map((option) => (
              <option key={option} value={option} className="bg-slate-900 text-slate-300">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Minimum Profit %</label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={minProfit}
              onChange={(event) => onMinProfitChange(Number(event.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span className="text-cyan-400">{minProfit}%</span>
              <span>10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesFilters;
