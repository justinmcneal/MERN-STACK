import { TokenProvider } from '../context/TokenContext';
import { useTokenContext } from '../context/useTokenContext';
import TokenTable from '../components/dashboard/TokenTable';

function DashboardInner() {
  const { tokens, loading, error, refresh } = useTokenContext();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          <button onClick={() => refresh()} className="px-3 py-1 bg-cyan-600 rounded">Refresh</button>
        </div>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {loading ? <div>Loading...</div> : <TokenTable tokens={tokens} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <TokenProvider pollIntervalMs={60_000}>
      <DashboardInner />
    </TokenProvider>
  );
}
