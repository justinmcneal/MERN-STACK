import { TrendingUp, BarChart3, Zap, User, Phone, HelpCircle, Settings, LogOut, Save, Info} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const SettingsPage = () => {
    const navigate = useNavigate();
    const activeTab = "Settings"; // Static
    const sidebarOpen = false; // Static
    const profileDropdownOpen = false; // Static
    const notificationOpen = false; // Static
    
    // General Settings - static values
    const themeMode = true; // Static - true = dark, false = light
    const dataRefreshInterval = "Every 30 seconds"; // Static
    const defaultCurrency = "Select Currency"; // Static
    
    // Monitoring Settings - static values
    const minProfitThreshold = 1.5; // Static
    const maxGasFee = 75; // Static

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

    const navigation = [
        { name: "Dashboard", icon: <BarChart3 className="w-5 h-5 text-white" /> , path: "/dashboard"  },
        { name: "Opportunities", icon: <Zap className="w-5 h-5 text-white" />, path: "/opportunities" },
        { name: "Profile", icon: <User className="w-5 h-5 text-white" />, path: "/profile" },
        { name: "Contact Support", icon: <Phone className="w-5 h-5 text-white" />, path: "/contact-support" },
        { name: "FAQ", icon: <HelpCircle className="w-5 h-5 text-white" />, path: "/faq" },
        { name: "About Us", icon: <Info className="w-5 h-5 text-white" /> , path: "/about us" },
        { name: "Settings", icon: <Settings className="w-5 h-5 text-white" />}
    ];

// Static navigation - no functions needed

  const handleSaveChanges = () => {
    // Static form submission - no actual processing
  };


  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-cyan-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
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
            onClick={() => {}}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition"
          >
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          
          <div className="p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Main Navigation</div>
            {/* Sidebar Navigation */}
          <nav className="space-y-2">
            {navigation.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  // Static navigation - no state changes
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
        <div className={`flex-1 overflow-y-auto transition-all duration-300
              ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
        onClick={() => {}} >
          
          {/* Header */}
          <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800/50 p-4 lg:p-6 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {}}
                  className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-slate-200">Settings</h1>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Notification */}
                <div className="relative">
                <button
                    onClick={() => {}}
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
                    onClick={() => {}}>
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
                {profileDropdownOpen &&
                createPortal(
                  <div className="fixed top-[85px] right-[39px] w-44 bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-lg z-50">
                    <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                      <User className="w-4 h-4 text-cyan-400" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                      <LogOut className="w-4 h-4 text-red-400" /> Logout
                    </button>
                  </div>,
                  document.body
                )}
                </div>
            </div>
            </div>
          </header>

          {/* Settings Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-200">General Settings</h2>
                    <p className="text-sm text-slate-400">Customize your interface and basic preferences</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Theme Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/50">
                    <div className="flex-1">
                      <h3 className="text-slate-200 font-medium mb-1">Theme Mode</h3>
                      <p className="text-sm text-slate-400">Switch between light and dark mode interface</p>
                    </div>
                    <ToggleSwitch 
                      enabled={themeMode}
                      onChange={() => {}}
                    />
                  </div>

                  {/* Data Refresh Interval */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-700/50">
                    <div className="flex-1">
                      <h3 className="text-slate-200 font-medium mb-1">Data Refresh Interval</h3>
                      <p className="text-sm text-slate-400">How often to refresh price data and opportunities</p>
                    </div>
                    <div className="relative w-full sm:w-48">
                      <select 
                        value={dataRefreshInterval}
                        onChange={() => {}}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all cursor-pointer"
                      >
                        {["Every 10 seconds","Every 30 seconds","Every 1 minute","Every 5 minutes"].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
                      </select>
                      <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Default Currency */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-slate-200 font-medium mb-1">Default Currency</h3>
                      <p className="text-sm text-slate-400">Primary currency for displaying values</p>
                    </div>
                    <div className="relative w-full sm:w-48">
                      <select 
                        value={defaultCurrency}
                        onChange={() => {}}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all cursor-pointer"
                      >
                        {["Select Currency","USD ($)","EUR (€)","GBP (£)","JPY (¥)","PHP (₱)"].map(t=> <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
                      </select>
                      <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitoring Settings */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-200">Monitoring Settings</h2>
                    <p className="text-sm text-slate-400">Configure monitoring parameters and performance thresholds.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Minimum Profit Threshold */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-slate-200 font-medium mb-1">Minimum Profit Threshold</h3>
                        <p className="text-sm text-slate-400">Only show opportunities above this profit percentage</p>
                      </div>
                      <div className="text-cyan-400 font-bold text-lg">{minProfitThreshold}%</div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={minProfitThreshold}
                        onChange={() => {}}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer profit-slider"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>0%</span>
                        <span>2.5%</span>
                        <span>5%</span>
                        <span>7.5%</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </div>

                  {/* Maximum Gas Fee Tolerance */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-slate-200 font-medium mb-1">Maximum Gas Fee Tolerance</h3>
                        <p className="text-sm text-slate-400">Skip opportunities where gas fees exceed this amount</p>
                      </div>
                      <input
                        type="number"
                        value={maxGasFee}
                        onChange={() => {}}
                        className="w-full sm:w-32 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
                <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <div className="flex flex-col items-center gap-4">
                    <button
                    onClick={handleSaveChanges}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                    <Save className="w-5 h-5" />
                    Save All Changes
                    </button>
                    <p className="text-sm text-slate-400 text-center">
                    Changes will be applied immediately to your account
                    </p>
                </div>
                </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {}}
        ></div>
      )}

      <style >{`
        .profit-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
        }
        .profit-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
        }
        .profit-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, 
            #1e293b 0%, 
            #ec4899 ${(minProfitThreshold / 10) * 100}%, 
            #334155 ${(minProfitThreshold / 10) * 100}%, 
            #334155 100%
          );
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;