import { BarChart3, Zap, User, Phone, HelpCircle, Settings, LogOut, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab] = useState("Dashboard");
    const [selectedTimeframe] = useState("1h");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const handleLogout = async () => {
        try {
            console.log('Logging out user:', user?.name);
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

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
  const priceData = [
    { token: "ETH", chain: "Ethereum", currentPrice: "$57,842.50", lastUpdated: "2s ago" },
    { token: "ETH", chain: "BSC", currentPrice: "$3,247.85", lastUpdated: "1s ago" },
    { token: "ETH", chain: "Polygon", currentPrice: "$6,098", lastUpdated: "3s ago" },
    { token: "USDT", chain: "Ethereum", currentPrice: "$149.75", lastUpdated: "2s ago" },
    { token: "USDT", chain: "BSC", currentPrice: "$6,409", lastUpdated: "5s ago" },
    { token: "USDC", chain: "ETH", currentPrice: "$14.85", lastUpdated: "1s ago" },
  ];
  const arbitrageOpportunities = [
    { token: "ETH", from: "Ethereum", to: "Polygon", priceDiff: "+6.5%", gasFee: "$5", estProfit: "$45", score: 95 },
    { token: "ETH", from: "BSC", to: "Ethereum", priceDiff: "+5.3%", gasFee: "$3", estProfit: "$30", score: 92 },
    { token: "USDT", from: "BSC", to: "Polygon", priceDiff: "+3.1%", gasFee: "$2", estProfit: "$10", score: 87 },
    { token: "USDC", from: "Ethereum", to: "BSC", priceDiff: "+5.2%", gasFee: "$1", estProfit: "$15", score: 84 },
    { token: "BNB", from: "BSC", to: "Ethereum", priceDiff: "+3.8%", gasFee: "$4", estProfit: "$45", score: 78 },
    { token: "MATIC", from: "Polygon", to: "Ethereum", priceDiff: "+3.3%", gasFee: "$15", estProfit: "$12", score: 75 },
  ];

  // Line Chart Component
  const ChartComponent = () => {
    const activeChart = 0;
    const selectedToken = "ETH";

    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        {/* Header: Token Trends + Timeframes + Dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>Token Trends
          </h3>
          <div className="flex gap-2 items-center">
            {["1h","24h","7d"].map(tf=>(
              <button key={tf} onClick={() => {}}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedTimeframe===tf?"bg-cyan-500/20 text-cyan-400 border border-cyan-500/30":"bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50"}`}>{tf}</button>
            ))}
            <div className="relative">
              <select value={selectedToken} onChange={() => {}}
                className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300">
                {["Select token","BTC","ETH","BNB","MATIC","USDT"].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Line Graph */}
        <div className="relative h-64 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(139,92,246,0.3)"/><stop offset="100%" stopColor="rgba(139,92,246,0)"/></linearGradient>
              <linearGradient id="ethereumGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(34,211,238,0.3)"/><stop offset="100%" stopColor="rgba(34,211,238,0)"/></linearGradient>
              <linearGradient id="bscGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(251,191,36,0.3)"/><stop offset="100%" stopColor="rgba(251,191,36,0)"/></linearGradient>
            </defs>

            { /* Polygon Line */ }
            <path d="M0 150 Q100 140 200 135 T400 130 T600 125 T800 120" stroke="#8b5cf6" strokeWidth="2" fill="none"/>
            <path d="M0 150 Q100 140 200 135 T400 130 T600 125 T800 120 L800 200 L0 200 Z" fill="url(#polygonGradient)"/>
            { /* Ethereum Line */ }
            <path d="M0 120 Q100 110 200 105 T400 100 T600 95 T800 90" stroke="#22d3ee" strokeWidth="2" fill="none"/>
            <path d="M0 120 Q100 110 200 105 T400 100 T600 95 T800 90 L800 200 L0 200 Z" fill="url(#ethereumGradient)"/>
            { /* BSC Line */ }
            <path d="M0 80 Q100 70 200 75 T400 65 T600 60 T800 55" stroke="#fbbf24" strokeWidth="2" fill="none"/>
            <path d="M0 80 Q100 70 200 75 T400 65 T600 60 T800 55 L800 200 L0 200 Z" fill="url(#bscGradient)"/>
            { /* Time & Price labels */ }
            {["00:00","00:15","00:30","00:45","01:00","01:15"].map((t,i)=> <text key={i} x={i*150} y="195" fill="#64748b" fontSize="10">{t}</text>)}
            {["$70k","$80k","$90k","$100k","$110k"].map((p,i)=> <text key={i} x="-25" y={185-30*i} fill="#64748b" fontSize="10">{p}</text>)}

            { /* Animated indicator */ }
            <circle cx={activeChart*16} cy={120-(activeChart*0.5)} r="4" fill="#22d3ee" className="animate-pulse"/>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 flex gap-10 text-xs mb-56 mr-20">
            {[
              {color:"purple-500",name:"Polygon"},
              {color:"cyan-400",name:"Ethereum"},
              {color:"yellow-400",name:"Binance Smart Chain"}
            ].map(l=>(
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

  // Stat Card Component
  const StatCard = ({icon, title, value, subtitle, color="cyan"}: {icon: React.ReactNode, title: string, value: string, subtitle: string, color?: string})=>(
    <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>{icon}</div>
            <span className="text-sm text-slate-400 font-medium">{title}</span>
          </div>
          <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
          <div className="text-sm text-slate-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );

  const navigation = [
    { name: "Dashboard", icon: <BarChart3 className="w-5 h-5 text-white" /> },
    { name: "Opportunities", icon: <Zap className="w-5 h-5 text-white" />, path: "/opportunities" },
    { name: "Profile", icon: <User className="w-5 h-5 text-white" />, path: "/profile" },
    { name: "Contact Support", icon: <Phone className="w-5 h-5 text-white" />, path: "/contact-support" },
    { name: "FAQ", icon: <HelpCircle className="w-5 h-5 text-white" />, path: "/faq" },
    { name: "About Us", icon: <Info className="w-5 h-5 text-white" /> , path: "/about-us" },
    { name: "Settings", icon: <Settings className="w-5 h-5 text-white" />, path: "/settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.cyan.900)/10,theme(colors.slate.950),theme(colors.purple.900)/10)]"></div>
      <div className="relative z-50 flex h-screen">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                      fixed inset-y-0 left-0 z-[100] w-64 transform 
                      bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 
                      transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:transform-none`}
        >

        <div className="flex items-center justify-between gap-3 p-6 border-b border-slate-800/50">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="font-bold text-lg">
              <span className="text-cyan-400">ArbiTrage</span>
              <span className="text-purple-400 ml-1">Pro</span>
            </div>
          </div>

          {/* X button (only visible on mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition"
          >
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        {/* Navigation */}
        <div className="p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Main Navigation</div>
          <nav className="space-y-2">
            {navigation.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  setSidebarOpen(false); // Close sidebar on mobile after navigation
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
        <div className={`flex-1 overflow-y-auto transition-all duration-300
              ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
        onClick={() => setSidebarOpen(false)} >
          
          {/* Header */}
          <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800/50 p-4 lg:p-6 relative z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <h1 className="text-xl font-semibold text-slate-200">Dashboard</h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Notification */}
                <div className="relative">
                <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all"
                >
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
                {notificationOpen &&
                      createPortal(
                        <div
                          className="fixed top-[70px] right-0 left-0 sm:right-[260px] sm:left-auto w-full sm:w-96 max-h-[70vh] bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-2xl shadow-xl z-[9999] overflow-hidden flex flex-col"
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
                              <div key={i} className="flex flex-col px-4 py-3 hover:bg-slate-800/30 transition">
                                {n.type === "price" ? (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-200 font-medium">{n.title}</span>
                                      <span className="text-xs text-cyan-400">{n.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1">{n.pair} reached your target of {n.target}</p>
                                    <p className="text-xs text-slate-400">Alert set: {n.target} • Current: {n.current}</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-200 font-medium">{n.title}</span>
                                      <span className="text-xs text-cyan-400">{n.time}</span>
                                    </div>
                                    <p className="text-sm text-emerald-400 mt-1">{n.details}</p>
                                    <p className="text-xs text-slate-400">Est. Profit: {n.profit} • Gas: {n.gas} • Score: {n.score}</p>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <button
                            onClick={() => navigate("/all-notifications")}
                            className="w-full py-3 text-center text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition"
                          >
                            View All Notifications
                          </button>
                        </div>,
                        document.body
                      )
                    }

                </div>

                {/* Profile */}
                <div className="relative z-50">
                  <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 cursor-pointer z-50"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-slate-200">{user?.name || 'User'}</div>
                      <div className="text-xs text-slate-400">Pro Trader</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 transition-transform duration-200" style={{transform: profileDropdownOpen?'rotate(180deg)':'rotate(0deg)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-lg z-50">
                      <button onClick={() => { navigate("/profile"); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"><User className="w-4 h-4 text-cyan-400"/> Profile</button>
                      <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"><LogOut className="w-4 h-4 text-red-400"/> Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <StatCard icon={<svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} title="Best Current Arbitrage Opportunity" value="ETH/USDC +2.5%" subtitle="$345 Profit | Ethereum → Polygon" color="cyan"/>
              <StatCard icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} title="Top Token by Spread" value="ETH" subtitle="2.4% avg spread | Chains: ETH, Polygon, BSC" color="purple"/>
              <StatCard icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} title="Total Tracked Tokens" value="523" subtitle="Current tokens tracked" color="emerald"/>
            </div>

            {/* Tables + Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Price Table */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg> Price Table
                  </h3>
                  <div className="flex gap-2">{["All Chains","By Chain","By Token"].map(f=><button key={f} className="px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50 transition-all">{f}</button>)}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        {["Token","Chain","Current Price","Last Updated"].map((h,i)=><th key={i} className="text-left text-xs text-slate-400 font-medium pb-3">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {priceData.map((p,i)=>(
                        <tr key={i} className="border-b border-slate-800/30">
                          <td className="py-3"><span className="font-medium text-slate-200">{p.token}</span></td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${p.chain==="Ethereum"?"bg-cyan-500/20 text-cyan-400":p.chain==="BSC"?"bg-yellow-500/20 text-yellow-400":"bg-purple-500/20 text-purple-400"}`}>{p.chain}</span>
                          </td>
                          <td className="py-3 text-right text-slate-200">{p.currentPrice}</td>
                          <td className="py-3 text-right text-xs text-slate-400">{p.lastUpdated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Arbitrage Opportunities */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Arbitrage Opportunities
              </h3>
              <div className="flex gap-2">
                {["By Profit", "By Token", "By Score"].map((f) => (
                  <button
                    key={f}
                    className="px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50 transition-all"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {["Token", "From → To", "Price Diff (%)", "Gas Fee", "Est Profit", "Score"].map(
                      (h, i) => (
                        <th
                          key={i}
                          className="text-left text-xs text-slate-400 font-medium pb-3 px-4"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {arbitrageOpportunities.map((a, i) => (
                    <tr key={i} className="border-b border-slate-800/30">
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">{a.token}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 text-sm">{a.from} → {a.to}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-400 font-medium">{a.priceDiff}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">{a.gasFee}</td>
                      <td className="py-3 px-4 text-right text-cyan-400 font-medium">{a.estProfit}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            a.score >= 90
                              ? "text-emerald-400"
                              : a.score >= 80
                              ? "text-yellow-400"
                              : "text-slate-400"
                          }`}
                        >
                          {a.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            </div>

            {/* Chart */}
            <ChartComponent/>
          </main>
          {notificationOpen && (
            <div
                className="fixed inset-0 bg-black/40 lg:hidden z-40"
                onClick={() => {}}
            />
            )}
        </div>
      </div>

      

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden " onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default Dashboard;
