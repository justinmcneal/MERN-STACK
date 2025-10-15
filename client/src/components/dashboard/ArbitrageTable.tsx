import React from 'react';

type Opportunity = {
  token: string;
  from: string;
  to: string;
  priceDiff: string;
  gasFee: string;
  estProfit: string;
  score: number;
};

const ArbitrageTable: React.FC<{ opportunities: Opportunity[] }> = ({ opportunities }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Arbitrage Opportunities
        </h3>
        <div className="flex gap-2">{['By Profit','By Token','By Score'].map(f=> <button key={f} className="px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50 transition-all">{f}</button>)}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {['Token','From → To','Price Diff (%)','Gas Fee','Est Profit','Score'].map((h,i)=> (
                <th key={i} className="text-left text-xs text-slate-400 font-medium pb-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opportunities.map((a,i)=> (
              <tr key={i} className="border-b border-slate-800/30">
                <td className="py-3 px-4"><span className="font-medium text-slate-200">{a.token}</span></td>
                <td className="py-3 px-4"><span className="text-slate-300 text-sm">{a.from} → {a.to}</span></td>
                <td className="py-3 px-4 text-right"><span className="text-emerald-400 font-medium">{a.priceDiff}</span></td>
                <td className="py-3 px-4 text-right text-slate-300">{a.gasFee}</td>
                <td className="py-3 px-4 text-right text-cyan-400 font-medium">{a.estProfit}</td>
                <td className="py-3 px-4 text-right"><span className={`font-bold ${a.score>=90?'text-emerald-400':a.score>=80?'text-yellow-400':'text-slate-400'}`}>{a.score}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArbitrageTable;
