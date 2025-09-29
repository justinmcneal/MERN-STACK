import React, { useState, useEffect } from "react";
import { BarChart3, Zap, User, Phone, HelpCircle, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OpportunitiesPage = () => {
    const navigate = useNavigate();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Opportunities");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
    const [selectedToken, setSelectedToken] = useState("All Tokens");
    const [selectedChainPair, setSelectedChainPair] = useState("All Chain Pairs");
    const [minProfit, setMinProfit] = useState(1);
    const [selectedTokenChart, setSelectedTokenChart] = useState("ETH");
    const [filterView, setFilterView] = useState("My Profit");
    const notifications = [
        {
            type: "price",
            title: "Price Target Hit",
            pair: "ETH/USDT",
            target: "$0.45",
            current: "$0.4523",
            time: "now",
        },
        {
            type: "arbitrage",
            title: "New Arbitrage Alert",
            details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
            profit: "$567",
            gas: "$15",
            score: 91,
            time: "now",
        },
        {
            type: "price",
            title: "Price Target Hit",
            pair: "ETH/USDT",
            target: "$0.45",
            current: "$0.4523",
            time: "36m ago",
        },
        {
            type: "arbitrage",
            title: "New Arbitrage Alert",
            details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
            profit: "$567",
            gas: "$15",
            score: 91,
            time: "1h ago",
        },
    ];
  
  // Mock data
  const [opportunities, setOpportunities] = useState([
    { token: "ETH", from: "Ethereum", to: "Polygon", priceDiff: "+2.5%", estProfit: "$50", roi: "95%", color: "emerald" },
    { token: "USDT", from: "BSC", to: "Polygon", priceDiff: "+1.8%", estProfit: "$45", roi: "85%", color: "emerald" },
    { token: "USDC", from: "Ethereum", to: "BSC", priceDiff: "+2.1%", estProfit: "$60", roi: "88%", color: "emerald" },
    { token: "BNB", from: "BSC", to: "Ethereum", priceDiff: "+3.2%", estProfit: "$120", roi: "91%", color: "emerald" },
    { token: "MATIC", from: "Polygon", to: "Ethereum", priceDiff: "+2.8%", estProfit: "$20", roi: "87%", color: "emerald" },
    { token: "DOT", from: "Polkadot", to: "Solana", priceDiff: "+1.4%", estProfit: "$105", roi: "76%", color: "yellow" }
  ]);

  const tokenPrices = {
    ETH: { ethereum: "$3,247.85", bsc: "$3,260.12", polygon: "$3,245.50" },
    USDT: { ethereum: "$0.998", bsc: "$1.001", polygon: "$0.999" },
    USDC: { ethereum: "$1.000", bsc: "$1.002", polygon: "$0.998" }
  };

  const gasFees = {
    ethereum: "0.002 ETH",
    bsc: "0.001 BNB", 
    polygon: "0.005 MATIC"
  };

  const ChartComponent = () => {
    const [activePoint, setActivePoint] = useState(0);
    const [selectedTokenChart, setSelectedTokenChart] = useState("ETH");
  
    useEffect(() => {
      const interval = setInterval(() => {
        setActivePoint(prev => (prev + 1) % 50);
      }, 100);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Token Trends
          </h3>
        </div>
  
        {/* Chart and Token Info Panel */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Chart */}
          <div className="xl:flex-1 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 relative">
          <div className="flex justify-end gap-2 items-center ">
            {["1h","24h","7d"].map(tf=>(
              <button key={tf} onClick={()=>setSelectedTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedTimeframe===tf?"bg-cyan-500/20 text-cyan-400 border border-cyan-500/30":"bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50"}`}>{tf}</button>
            ))}
            <div className="relative">
              <select value={selectedToken} onChange={e=>setSelectedToken(e.target.value)}
                className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300">
                {["Select token","BTC","ETH","BNB","MATIC","USDT"].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
            <svg className="w-full h-full" viewBox="0 0 800 200">
              {/* Gradient defs */}
              <defs>
                <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.0)" />
                </linearGradient>
                <linearGradient id="ethereumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                  <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
                </linearGradient>
                <linearGradient id="bscGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(251, 191, 36, 0.3)" />
                  <stop offset="100%" stopColor="rgba(251, 191, 36, 0.0)" />
                </linearGradient>
              </defs>
  
              {/* Polygon Line */}
              <path d="M 0 150 Q 100 140 200 135 T 400 130 T 600 125 T 800 120" stroke="#8b5cf6" strokeWidth="2" fill="none" />
              <path d="M 0 150 Q 100 140 200 135 T 400 130 T 600 125 T 800 120 L 800 200 L 0 200 Z" fill="url(#polygonGradient)" />
  
              {/* Ethereum Line */}
              <path d="M 0 120 Q 100 110 200 105 T 400 100 T 600 95 T 800 90" stroke="#22d3ee" strokeWidth="2" fill="none" />
              <path d="M 0 120 Q 100 110 200 105 T 400 100 T 600 95 T 800 90 L 800 200 L 0 200 Z" fill="url(#ethereumGradient)" />
  
              {/* BSC Line */}
              <path d="M 0 80 Q 100 70 200 75 T 400 65 T 600 60 T 800 55" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M 0 80 Q 100 70 200 75 T 400 65 T 600 60 T 800 55 L 800 200 L 0 200 Z" fill="url(#bscGradient)" />
  
              {/* Labels */}
              <text x="0" y="195" fill="#64748b" fontSize="10">00:00</text>
              <text x="150" y="195" fill="#64748b" fontSize="10">00:15</text>
              <text x="300" y="195" fill="#64748b" fontSize="10">00:30</text>
              <text x="450" y="195" fill="#64748b" fontSize="10">00:45</text>
              <text x="600" y="195" fill="#64748b" fontSize="10">01:00</text>
              <text x="750" y="195" fill="#64748b" fontSize="10">01:15</text>
  
              {/* Animated indicator */}
              <circle cx={activePoint * 16} cy={120 - activePoint * 0.5} r="4" fill="#22d3ee" className="animate-pulse" />
            </svg>
  
            {/* Chart Legend */}
            <div className="absolute top-20 right-12 flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-slate-400">Polygon</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span className="text-slate-400">Ethereum</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-slate-400">Binance Smart Chain</span>
                </div>
            </div>
          </div>
  
  
          {/* Token Info Panel */}
          <div className="xl:w-1/3 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-400 font-bold text-sm">Ξ</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Token: ETH</div>
                </div>
              </div>
  
              {/* Token Selector */}
              <div className="relative">
                <select
                  value={selectedTokenChart}
                  onChange={(e) => setSelectedTokenChart(e.target.value)}
                  className="appearance-none px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                >
                  {["Select token","BTC","ETH","BNB","MATIC","USDT"].map(t => (
                    <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
  
            {/* Prices */}
            <div>
              <h4 className="text-slate-400 text-sm mb-3">Prices per Chain</h4>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-300">Ethereum</span><span className="text-slate-200 font-medium">$3,247.85</span></div>
                <div className="flex justify-between"><span className="text-slate-300">BSC</span><span className="text-slate-200 font-medium">$3,260.12</span></div>
                <div className="flex justify-between"><span className="text-slate-300">Polygon</span><span className="text-slate-200 font-medium">$3,245.50</span></div>
              </div>
            </div>
  
            {/* Gas Fees */}
            <div>
              <h4 className="text-slate-400 text-sm mb-3">Gas Fee Estimation per Chain</h4>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-300">Ethereum</span><span className="text-slate-200 font-medium">0.002 ETH</span></div>
                <div className="flex justify-between"><span className="text-slate-300">BSC</span><span className="text-slate-200 font-medium">0.001 BNB</span></div>
                <div className="flex justify-between"><span className="text-slate-300">Polygon</span><span className="text-slate-200 font-medium">0.005 MATIC</span></div>
              </div>
            </div>
  
            {/* ROI */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <div className="text-emerald-400 text-sm font-medium">ROI: 95%</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  const navigation = [
    { name: "Dashboard", icon: <BarChart3 className="w-5 h-5 text-white" />, path: "/dashboard" },
    { name: "Opportunities", icon: <Zap className="w-5 h-5 text-white" />},
    { name: "Profile", icon: <User className="w-5 h-5 text-white" />, path: "/profile" },
    { name: "Contact Support", icon: <Phone className="w-5 h-5 text-white" />, path: "/contact-support" },
    { name: "FAQ", icon: <HelpCircle className="w-5 h-5 text-white" />, path: "/faq" },
    { name: "Settings", icon: <Settings className="w-5 h-5 text-white" />, path: "/settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur border-r border-slate-800/50 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center gap-3 p-6 border-b border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <div className="font-bold text-lg">
              <span className="text-cyan-400">ArbiTrader</span>
              <span className="text-purple-400 ml-1">Pro</span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Main Navigation</div>
            {/* Sidebar Navigation */}
                <nav className="space-y-2">
                {navigation.map(item => (
                <button
                    key={item.name}
                    onClick={() => {
                    setActiveTab(item.name);
                    if (item.path) {
                        navigate(item.path);
                    }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.name
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800/50 p-4 lg:p-6 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-slate-200">Opportunities</h1>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Notification */}
                    <div className="relative">
                        <button
                            onClick={() => setNotificationOpen((p) => !p)}
                                className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all">
                                  <svg
                                  className="w-5 h-5 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  >
                                  <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.164 6.562 4 9.138 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.862-2.164-5.438-5-5.93V5c0-1.657-1.343-3-3-3zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
                                  </svg>
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                                  {notifications.length}
                                  </div>
                              </button>
              
                              {/* Notification Dropdown */}
                                  {notificationOpen && (
                                  <div
                                      className="
                                      fixed
                                      top-16               
                                      left-4 right-4        
                                      sm:absolute sm:right-6 sm:left-auto
                                      sm:top-12
                                      mt-2
                                      w-auto sm:w-96        
                                      max-h-[70vh]
                                      bg-slate-900/95 backdrop-blur
                                      border border-slate-700/50
                                      rounded-2xl shadow-xl
                                      z-50 overflow-hidden flex flex-col
                                      "
                                  >
                                      {/* Header */}
                                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                                      <div className="flex items-center gap-2">
                                          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.164 6.562 4 9.138 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.862-2.164-5.438-5-5.93V5c0-1.657-1.343-3-3-3zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
                                          </svg>
                                          <span className="font-semibold text-slate-200">Notifications</span>
                                      </div>
                                      <div className="flex gap-6">
                                          <button className="text-xs text-slate-400 hover:text-slate-200">Mark All Read</button>
                                          <button className="text-xs text-slate-400 hover:text-slate-200">Clear All</button>
                                      </div>
                                      </div>
              
                                      {/* List */}
                                      <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/50">
                                      {notifications.map((n, i) => (
                                          <div
                                          key={i}
                                          className="flex flex-col px-4 py-3 hover:bg-slate-800/30 transition"
                                      >
                                          {n.type === "price" && (
                                          <>
                                              <div className="flex items-center justify-between">
                                              <span className="text-slate-200 font-medium">
                                                  {n.title}
                                              </span>
                                              <span className="text-xs text-cyan-400">{n.time}</span>
                                              </div>
                                              <p className="text-sm text-slate-300 mt-1">
                                              {n.pair} reached your target of {n.target}
                                              </p>
                                              <p className="text-xs text-slate-400">
                                              Alert set: {n.target} • Current: {n.current}
                                              </p>
                                          </>
                                          )}
                                          {n.type === "arbitrage" && (
                                          <>
                                              <div className="flex items-center justify-between">
                                              <span className="text-slate-200 font-medium">
                                                  {n.title}
                                              </span>
                                              <span className="text-xs text-cyan-400">{n.time}</span>
                                              </div>
                                              <p className="text-sm text-emerald-400 mt-1">
                                              {n.details}
                                              </p>
                                              <p className="text-xs text-slate-400">
                                              Est. Profit: {n.profit} • Gas: {n.gas} • Score: {n.score}
                                              </p>
                                          </>
                                          )}
                                      </div>
                                      ))}
                                      </div>
              
                                      {/* Footer */}
                                      <button className="w-full py-3 text-center text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition">
                                      View All Notifications
                                      </button>
                                  </div>
                                  )}
              
                              </div>
              
                        {/* Profile */}
                        <div className="relative z-50">
                            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 cursor-pointer z-50"
                                  onClick={()=>setProfileDropdownOpen(!profileDropdownOpen)}>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">JW</span>
                                </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-medium text-slate-200">John Wayne</div>
                                <div className="text-xs text-slate-400">Pro Trader</div>
                            </div>
                                <svg className="w-4 h-4 text-slate-400 transition-transform duration-200" style={{transform: profileDropdownOpen?'rotate(180deg)':'rotate(0deg)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                            {profileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-lg z-50">
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"><User className="w-4 h-4 text-cyan-400"/> Profile</button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"><LogOut className="w-4 h-4 text-red-400"/> Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-200">Arbitrage Opportunities</h1>
                <p className="text-slate-400">Discover profitable trading opportunities across multiple exchanges and chains</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-200">Filter Opportunities</h3>
                <button className="ml-auto px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300 hover:bg-slate-600/50 transition-all">
                  Reset All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Filter by Token</label>
                  <select 
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
                    {["All Token","BTC","ETH","BNB","MATIC","USDT"].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Filter by Chain Pair</label>
                  <select 
                    value={selectedChainPair}
                    onChange={(e) => setSelectedChainPair(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  >
                   {["All Chain Pairs","Ethereum → Polygon","BSC → Ethereum","Polygon → BSC"].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
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
                      onChange={(e) => setMinProfit(Number(e.target.value))}
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

            {/* Opportunities Table */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  Expanded Arbitrage Opportunities
                </h3>
                <div className="flex gap-2">
                  {["My Profit", "By Token", "ROI"].map((view) => (
                    <button
                      key={view}
                      onClick={() => setFilterView(view)}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        filterView === view
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
                    {opportunities.map((opp, index) => (
                      <tr key={index} className="border-b border-slate-800/30 hover:bg-slate-700/20 transition-all">
                        <td className="py-4">
                          <span className="font-semibold text-slate-200 text-lg">{opp.token}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-slate-300">{opp.from} → {opp.to}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`font-bold text-lg ${
                            opp.color === 'emerald' ? 'text-emerald-400' : 'text-yellow-400'
                          }`}>
                            {opp.priceDiff}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-slate-200 font-medium">{opp.estProfit}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`font-bold ${
                            opp.color === 'emerald' ? 'text-emerald-400' : 'text-yellow-400'
                          }`}>
                            {opp.roi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Section */}
            <ChartComponent />
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};

export default OpportunitiesPage;