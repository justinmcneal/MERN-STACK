const OpportunitiesHero: React.FC = () => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Arbitrage Opportunities</h1>
        <p className="text-slate-400">Monitor opportunities across multiple exchanges and chains with real-time insights.</p>
      </div>
    </div>
  );
};

export default OpportunitiesHero;
