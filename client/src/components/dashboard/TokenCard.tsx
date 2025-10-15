import type { TokenDto } from '../../services/TokenService';

export default function TokenCard({ token }: { token: TokenDto }) {
  return (
    <div className="p-4 bg-slate-800 rounded-md shadow">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm text-slate-400">{token.symbol} • {token.chain}</div>
          <div className="text-xl font-semibold">${token.currentPrice.toFixed(4)}</div>
        </div>
        <div className="text-xs text-slate-400">{new Date(token.lastUpdated).toLocaleString()}</div>
      </div>
    </div>
  );
}
