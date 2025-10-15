import type { TokenDto } from '../../services/TokenService';

export default function TokenTable({ tokens }: { tokens: TokenDto[] }) {
  return (
    <div className="overflow-x-auto bg-slate-800 rounded-md p-4">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left text-sm text-slate-400">
            <th className="py-2">Symbol</th>
            <th className="py-2">Chain</th>
            <th className="py-2">Price (USD)</th>
            <th className="py-2">Last Updated</th>
            <th className="py-2">Contract</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(t => (
            <tr key={`${t.symbol}-${t.chain}`} className="border-t border-slate-700">
              <td className="py-2">{t.symbol}</td>
              <td className="py-2">{t.chain}</td>
              <td className="py-2">${t.currentPrice.toFixed(6)}</td>
              <td className="py-2">{new Date(t.lastUpdated).toLocaleString()}</td>
              <td className="py-2 break-all text-sm text-slate-300">{t.contractAddress || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
