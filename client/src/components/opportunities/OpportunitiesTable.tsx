import type { OpportunityItem } from "./types";

type OpportunitiesTableProps = {
  opportunities: OpportunityItem[];
  activeView: string;
  onViewChange: (view: string) => void;
  viewOptions: string[];
};

const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
  activeView,
  onViewChange,
  viewOptions,
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Expanded Arbitrage Opportunities
        </h3>
        <div className="flex gap-2">
          {viewOptions.map((view) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                activeView === view
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left text-xs text-slate-400 font-medium pb-4">Token</th>
              <th className="text-left text-xs text-slate-400 font-medium pb-4">From → To</th>
              <th className="text-right text-xs text-slate-400 font-medium pb-4">Price Diff (%)</th>
              <th className="text-right text-xs text-slate-400 font-medium pb-4">Est Profit</th>
              <th className="text-right text-xs text-slate-400 font-medium pb-4">ROI %</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opportunity, index) => (
              <tr key={`${opportunity.token}-${index}`} className="border-b border-slate-800/30 hover:bg-slate-700/20 transition-all">
                <td className="py-4">
                  <span className="font-semibold text-slate-200 text-lg">{opportunity.token}</span>
                </td>
                <td className="py-4">
                  <span className="text-slate-300">{opportunity.from} → {opportunity.to}</span>
                </td>
                <td className="py-4 text-right">
                  <span className={`font-bold text-lg ${
                    opportunity.color === "emerald" ? "text-emerald-400" : "text-yellow-400"
                  }`}
                  >
                    {opportunity.priceDiff}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <span className="text-slate-200 font-medium">{opportunity.estProfit}</span>
                </td>
                <td className="py-4 text-right">
                  <span className={`font-bold ${
                    opportunity.color === "emerald" ? "text-emerald-400" : "text-yellow-400"
                  }`}
                  >
                    {opportunity.roi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunitiesTable;
