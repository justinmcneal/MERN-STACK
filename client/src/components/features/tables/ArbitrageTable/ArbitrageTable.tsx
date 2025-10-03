import React from 'react';
import Card from '../../../ui/Card/Card';

export interface ArbitrageData {
  token: string;
  from: string;
  to: string;
  priceDiff: string;
  gasFee: string;
  estProfit: string;
  score: number;
}

interface ArbitrageTableProps {
  data: ArbitrageData[];
  title?: string;
  className?: string;
}

const ArbitrageTable: React.FC<ArbitrageTableProps> = ({
  data,
  title = "Top Arbitrage Opportunities",
  className = ""
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/20 text-emerald-400';
    if (score >= 80) return 'bg-cyan-500/20 text-cyan-400';
    return 'bg-orange-500/20 text-orange-400';
  };

  return (
    <Card className={`${className}`}>
      <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Token</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">From → To</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Price Diff</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Gas Fee</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Est. Profit</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index} 
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">{item.token}</td>
                <td className="py-3 px-4 text-slate-300">{item.from} → {item.to}</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">{item.priceDiff}</td>
                <td className="py-3 px-4 text-slate-300">{item.gasFee}</td>
                <td className="py-3 px-4 text-cyan-400 font-medium">{item.estProfit}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.score)}`}>
                    {item.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ArbitrageTable;
