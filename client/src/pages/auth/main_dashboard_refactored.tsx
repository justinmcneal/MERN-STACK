import React, { useState, useEffect } from "react";
import { Layout, type Notification } from "../../components/layout";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");

  // Mock notifications data
  const notifications: Notification[] = [
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

  // Mock user data
  const user = {
    name: "John Wayne",
    email: "johnwayne@gmail.com",
  };

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
    const [activeChart, setActiveChart] = useState(0);
    const [selectedToken, setSelectedToken] = useState("Select token");
    
    useEffect(() => { 
      const i = setInterval(() => setActiveChart(p => (p+1)%50), 100); 
      return () => clearInterval(i); 
    }, []);

    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        {/* Header: Token Trends + Timeframes + Dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Token Trends
          </h3>
          <div className="flex gap-2 items-center">
            {["1h","24h","7d"].map(tf=>(
              <button key={tf} onClick={()=>setSelectedTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedTimeframe===tf?"bg-cyan-500/20 text-cyan-400 border border-cyan-500/30":"bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50"}`}>
                {tf}
              </button>
            ))}
            <div className="relative">
              <select value={selectedToken} onChange={e=>setSelectedToken(e.target.value)}
                className="appearance-none w-full px-3 py-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300">
                {["Select token","BTC","ETH","BNB","MATIC","USDT"].map(t=> 
                  <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>
                )}
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Line Graph */}
        <div className="h-64 bg-slate-900/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
            {Array.from({length: 50}, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-1 rounded-t transition-all duration-300 ${
                    i === activeChart ? 'bg-gradient-to-t from-cyan-500 to-purple-500 h-16' :
                    i > activeChart ? 'bg-slate-600 h-8' : 'bg-slate-700 h-4'
                  }`}
                />
                {i % 10 === 0 && (
                  <span className="text-xs text-slate-500 mt-2">
                    {new Date(Date.now() - (49-i) * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
  };

  const handleMarkAllRead = () => {
    console.log('Mark all notifications as read');
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <Layout
      title="Dashboard"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      notifications={notifications}
      user={user}
      onNotificationClick={handleNotificationClick}
      onMarkAllRead={handleMarkAllRead}
      onLogout={handleLogout}
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Opportunities</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 5.5L9 10l-4.5 4.5L0 10l4.5-4.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Profit</p>
                <p className="text-2xl font-bold text-white">$2,847</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">94%</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Component */}
        <ChartComponent />

        {/* Price Data Table */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Live Token Prices</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Token</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Chain</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Current Price</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {priceData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{item.token}</td>
                    <td className="py-3 px-4 text-slate-300">{item.chain}</td>
                    <td className="py-3 px-4 text-cyan-400 font-medium">{item.currentPrice}</td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Arbitrage Opportunities */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Top Arbitrage Opportunities</h3>
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
                {arbitrageOpportunities.map((item, index) => (
                  <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{item.token}</td>
                    <td className="py-3 px-4 text-slate-300">{item.from} → {item.to}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{item.priceDiff}</td>
                    <td className="py-3 px-4 text-slate-300">{item.gasFee}</td>
                    <td className="py-3 px-4 text-cyan-400 font-medium">{item.estProfit}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.score >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                        item.score >= 80 ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {item.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
