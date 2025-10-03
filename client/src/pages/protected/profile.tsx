import { useState } from "react";
import { BarChart3, Zap, User, Phone, HelpCircle, Settings, LogOut, Shield, Save, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Profile");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    
    // Form states
    const [fullName, setFullName] = useState("John Wayne");
    const [email, setEmail] = useState("johnwayne@gmail.com");
    const [joinDate] = useState("March 11, 2025");
    const [selectedAvatar, setSelectedAvatar] = useState(0);
    
    // Preferences
    const [tokensTracked, setTokensTracked] = useState({
        ETH: true,
        BTC: true,
        MATIC: true,
        USDT: false,
        BNB: false
    });
    
    const [dashboardPopup, setDashboardPopup] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [profitThreshold, setProfitThreshold] = useState(5);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);


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

  const avatars = [
    { id: 0, initials: "JW", gradient: "from-cyan-400 to-purple-500" },
    { id: 1, initials: "AT", gradient: "from-emerald-400 to-cyan-500" },
    { id: 2, initials: "PT", gradient: "from-pink-400 to-orange-500" },
    { id: 3, initials: "BT", gradient: "from-blue-400 to-indigo-500" },
    { id: 4, initials: "GT", gradient: "from-yellow-400 to-red-500" },
    { id: 5, initials: "MT", gradient: "from-purple-400 to-pink-500" }
  ];

  const navigation = [
    { name: "Dashboard", icon: <BarChart3 className="w-5 h-5 text-white" />, path: "/dashboard" },
    { name: "Opportunities", icon: <Zap className="w-5 h-5 text-white" />, path: "/opportunities" },
    { name: "Profile", icon: <User className="w-5 h-5 text-white" /> },
    { name: "Contact Support", icon: <Phone className="w-5 h-5 text-white" />, path: "/contact-support" },
    { name: "FAQ", icon: <HelpCircle className="w-5 h-5 text-white" />, path: "/faq" },
    { name: "About Us", icon: <Info className="w-5 h-5 text-white" /> , path: "/about us" },
    { name: "Settings", icon: <Settings className="w-5 h-5 text-white" />, path: "/settings" }
  ];

  // Navigation function commented out (unused)

  const handleSaveChanges = () => {
    alert("Changes saved successfully!");
  };

  const TokenCheckbox = ({ token, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-2 focus:ring-cyan-400/50"
      />
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
        checked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
      }`}>
        {token}
      </span>
    </label>
  );

  const ToggleSwitch = ({ enabled, onChange }: any) => (
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
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur border-r border-slate-800/50 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center gap-3 p-6 border-b border-slate-800/50">
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
                <h1 className="text-xl font-semibold text-slate-200">Profile</h1>
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
                        className="fixed top-16 left-4 right-4 sm:absolute sm:right-6 sm:left-auto sm:top-12 mt-2 w-auto sm:w-96 max-h-[70vh] bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
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
                                <button onClick={() => navigate("/all-notifications")} className="w-full py-3 text-center text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition">
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
                                <button  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"><User className="w-4 h-4 text-cyan-400"/> Profile</button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"><LogOut className="w-4 h-4 text-red-400"/> Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </header>

          {/* Profile Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Profile Information */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-200">Profile Information</h2>
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Join Date</label>
                    <div className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-xl text-slate-300">
                      {joinDate}
                    </div>
                  </div>

                  {/* Profile Picture */}
                    <div>
                    <label className="block text-sm text-slate-400 mb-3">Profile Picture</label>

                    {/* Centered profile preview */}
                    <div className="flex items-center justify-center mb-4">
                        <div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatars[selectedAvatar].gradient} flex items-center justify-center shadow-lg`}
                        >
                        <span className="text-white font-bold text-2xl">
                            {avatars[selectedAvatar].initials}
                        </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-4">
                        <div className="text-xs text-slate-400 mb-3">
                            Ready-made character options
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-4">
                        <div className="flex flex-wrap gap-3">
                            {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.id)}
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center transition-all ${
                                selectedAvatar === avatar.id
                                    ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-800 scale-110"
                                    : "hover:scale-105 opacity-70 hover:opacity-100"
                                }`}
                            >
                                <span className="text-white font-bold text-sm">{avatar.initials}</span>
                            </button>
                            ))}
                        </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-200">Preferences</h2>
                </div>

                <div className="space-y-6">
                  {/* Tokens Tracked */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tokens Tracked</label>
                    <p className="text-xs text-slate-500 mb-3">Select which tokens to monitor for arbitrage opportunities.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(tokensTracked).map(([token, checked]) => (
                        <TokenCheckbox
                          key={token}
                          token={token}
                          checked={checked}
                          onChange={() => setTokensTracked(prev => ({ ...prev, [token]: !checked }))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-3">Notification Settings</label>
                    <p className="text-xs text-slate-500 mb-4">Choose how to receive alerts (email, dashboard popup).</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-sm text-slate-300">Dashboard Popup</span>
                        <ToggleSwitch 
                          enabled={dashboardPopup}
                          onChange={() => setDashboardPopup(!dashboardPopup)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-sm text-slate-300">Email</span>
                        <ToggleSwitch 
                          enabled={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alert Thresholds */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Alert Thresholds</label>
                    <p className="text-xs text-slate-500 mb-3">Set minimum profit percentage for notifications.</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Notify me if profit</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center text-cyan-400 font-medium">&gt;</span>
                          <input
                            type="number"
                            value={profitThreshold}
                            onChange={(e) => setProfitThreshold(Number(e.target.value))}
                            className="w-16 px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                          />
                          <span className="text-slate-400">%</span>
                        </div>
                      </div>
                      
                      <div className="relative pt-1">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={profitThreshold}
                           onChange={(e) => setProfitThreshold(Number(e.target.value))}
                          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0%</span>
                          <span>5%</span>
                          <span>10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-200">Security</h2>
                </div>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200 mb-1">Change Password</h3>
                        <p className="text-xs text-slate-400">Select which tokens to monitor for arbitrage opportunities.</p>
                      </div>
                      <button className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500/50 rounded-lg text-sm text-slate-200 transition-all">
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-200 mb-1">Two-Factor Authentication</h3>
                        <p className="text-xs text-slate-400">Enhancing account security with multi-layer authentication.</p>
                      </div>
                      <ToggleSwitch 
                        enabled={twoFactorAuth}
                        onChange={() => setTwoFactorAuth(!twoFactorAuth)}
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
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        input[type="range"]::-moz-range-thumb {
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

export default ProfilePage;