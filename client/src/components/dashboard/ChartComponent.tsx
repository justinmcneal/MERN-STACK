import React from 'react';

const ChartComponent: React.FC = () => {
  const activeChart = 0;
  const selectedToken = 'ETH';

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>Token Trends
        </h3>
        <div className="flex gap-2 items-center">
          {['1h','24h','7d'].map(tf=> (
            <button key={tf} onClick={() => {}} className={`px-3 py-1 text-xs rounded-lg transition-all bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50`}>{tf}</button>
          ))}
          <div className="relative">
            <select value={selectedToken} onChange={() => {}} className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300">
              {['Select token','BTC','ETH','BNB','MATIC','USDT'].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          <defs>
            <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(139,92,246,0.3)"/><stop offset="100%" stopColor="rgba(139,92,246,0)"/></linearGradient>
            <linearGradient id="ethereumGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(34,211,238,0.3)"/><stop offset="100%" stopColor="rgba(34,211,238,0)"/></linearGradient>
            <linearGradient id="bscGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(251,191,36,0.3)"/><stop offset="100%" stopColor="rgba(251,191,36,0)"/></linearGradient>
          </defs>

          <path d="M0 150 Q100 140 200 135 T400 130 T600 125 T800 120" stroke="#8b5cf6" strokeWidth="2" fill="none"/>
          <path d="M0 150 Q100 140 200 135 T400 130 T600 125 T800 120 L800 200 L0 200 Z" fill="url(#polygonGradient)"/>
          <path d="M0 120 Q100 110 200 105 T400 100 T600 95 T800 90" stroke="#22d3ee" strokeWidth="2" fill="none"/>
          <path d="M0 120 Q100 110 200 105 T400 100 T600 95 T800 90 L800 200 L0 200 Z" fill="url(#ethereumGradient)"/>
          <path d="M0 80 Q100 70 200 75 T400 65 T600 60 T800 55" stroke="#fbbf24" strokeWidth="2" fill="none"/>
          <path d="M0 80 Q100 70 200 75 T400 65 T600 60 T800 55 L800 200 L0 200 Z" fill="url(#bscGradient)"/>

          {['00:00','00:15','00:30','00:45','01:00','01:15'].map((t,i)=> <text key={i} x={i*150} y="195" fill="#64748b" fontSize="10">{t}</text>)}
          {['$70k','$80k','$90k','$100k','$110k'].map((p,i)=> <text key={i} x="-25" y={185-30*i} fill="#64748b" fontSize="10">{p}</text>)}

          <circle cx={activeChart*16} cy={120-(activeChart*0.5)} r="4" fill="#22d3ee" className="animate-pulse"/>
        </svg>

        <div className="absolute bottom-4 right-4 flex gap-10 text-xs mb-56 mr-20">
          {[{color:'purple-500',name:'Polygon'},{color:'cyan-400',name:'Ethereum'},{color:'yellow-400',name:'Binance Smart Chain'}].map(l=> (
            <div key={l.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-${l.color}`}></div>
              <span className="text-slate-400">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
