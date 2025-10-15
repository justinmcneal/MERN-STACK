import React from 'react';
import { useTokenContext } from '../../context/useTokenContext';

const PriceTable: React.FC = () => {
  const { tokens, loading } = useTokenContext();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            {['Token', 'Chain', 'Current Price', 'Last Updated'].map((h, i) => (
              <th key={i} className="text-left text-xs text-slate-400 font-medium pb-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="space-y-2">
          {loading && <tr><td>Loading...</td></tr>}
          {!loading && tokens.map((t, i) => (
            <tr key={`${t.symbol}-${t.chain}-${i}`} className="border-b border-slate-800/30">
              <td className="py-3"><span className="font-medium text-slate-200">{t.symbol}</span></td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded text-xs ${t.chain === 'ethereum' ? 'bg-cyan-500/20 text-cyan-400' : t.chain === 'bsc' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{t.chain}</span>
              </td>
              <td className="py-3 text-right text-slate-200">${Number(t.currentPrice).toLocaleString()}</td>
              <td className="py-3 text-right text-xs text-slate-400">{new Date(t.lastUpdated).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;
