import { ChevronDown, ChevronUp, BarChart3, Zap, User, Phone, HelpCircle, Settings, LogOut, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


const FAQPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab] = useState("FAQ");
    const [sidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationOpen] = useState(false);
    
    const handleLogout = async () => {
        try {
            console.log('Logging out user:', user?.name);
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

  const navigation = [
    { name: "Dashboard", icon: <BarChart3 className="w-5 h-5 text-white" /> , path: "/dashboard"  },
    { name: "Opportunities", icon: <Zap className="w-5 h-5 text-white" />, path: "/opportunities" },
    { name: "Profile", icon: <User className="w-5 h-5 text-white" />, path: "/profile" },
    { name: "Contact Support", icon: <Phone className="w-5 h-5 text-white" />, path: "/contact-support" },
    { name: "FAQ", icon: <HelpCircle className="w-5 h-5 text-white" /> },
    { name: "About Us", icon: <Info className="w-5 h-5 text-white" />, path: "/about us" },
    { name: "Settings", icon: <Settings className="w-5 h-5 text-white" /> , path: "/settings"}
];

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

  const faqData = [
    {
      question: "What is arbitrage?",
      answer: "Arbitrage in cryptocurrency refers to the monitoring of price discrepancies for the same token across different exchanges. It is used to identify market inefficiencies and highlight potential opportunities without engaging in direct trading."
    },
    {
      question: "Which chains/tokens are supported",
      answer: "We currently support major blockchains including Ethereum, Binance Smart Chain (BSC), and Polygon. Popular tokens include BTC, ETH, USDT, BNB, and MATIC. We're constantly adding new chains and tokens based on user demand."
    },
    {
      question: "Is trading required to use Arbitrage monitoring?",
      answer: "No. The monitoring tool strictly observes and reports price differences. It does not perform any buying, selling, or trading."
    },
    {
      question: "Can I customize which tokens to monitor?",
      answer: "Yes, you can customize your token monitoring preferences in the Profile settings. Select which tokens you want to track and set custom alerts for specific price movements or arbitrage opportunities."
    },
    {
      question: "How often are token prices updated?",
      answer: "Token prices are updated in real-time with sub-second latency. Our enterprise-grade infrastructure processes over 10,000 price feeds simultaneously to ensure you have the most current market data."
    },
    {
      question: "Can I monitor multiple exchanges at once?",
      answer: "Absolutely! ArbiTrader Pro monitors multiple exchanges simultaneously, including Uniswap, Sushiswap, PancakeSwap, and more. This cross-exchange monitoring is essential for identifying profitable arbitrage opportunities."
    },
    {
      question: "Can I receive alerts for significant price differences?",
      answer: "Yes. Users can set thresholds to receive notifications when a token's price difference exceeds a specified percentage across exchanges."
    },
    {
      question: "Are gas fees considered in arbitrage monitoring reports?",
      answer: "Yes, gas fees are factored into all opportunity calculations. Our AI-powered scoring system analyzes liquidity depth, slippage tolerance, gas costs, and historical patterns to provide accurate profit estimates."
    },
    {
      question: "Does the monitoring tool provide visual charts or reports?",
      answer: "Yes, ArbiTrader Pro includes comprehensive visual analytics with real-time charts, historical trend analysis, P&L tracking, and customizable reporting for tax compliance and strategy optimization."
    }
  ];

// Static navigation - no functions needed

  const FAQItem = ({ question, answer, isOpen }: { question: string, answer: string, isOpen: boolean }) => (
    <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-500/50">
      <button
        onClick={() => {}}
        className="w-full flex items-start justify-between p-5 text-left transition-all"
      >
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            isOpen ? 'bg-cyan-500/20' : 'bg-slate-600/50'
          }`}>
            {isOpen ? (
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
            )}
          </div>
          <span className="text-slate-200 font-medium pr-4">{question}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 pl-[52px]">
          <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
            <p className="text-slate-300 text-sm leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
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
                <h1 className="text-xl font-semibold text-slate-200">FAQs</h1>
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
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
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
                    {profileDropdownOpen &&
                    createPortal(
                      <div className="fixed top-[85px] right-[39px] w-44 bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-lg z-50">
                        <button onClick={() => { navigate("/profile"); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                          <User className="w-4 h-4 text-cyan-400" /> Profile
                        </button>
                        <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
                          <LogOut className="w-4 h-4 text-red-400" /> Logout
                        </button>
                      </div>,
                      document.body
                    )}
                    </div>
                </div>
            </div>
          </header>

          {/* FAQ Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-5xl mx-auto">
              {/* Page Header */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-200">FAQ (Frequently Asked Questions)</h1>
                  </div>
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {faqData.map((item, index) => (
                  <FAQItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={false}
                  />
                ))}
              </div>

              {/* Contact Support Banner */}
              <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-1">Still have questions?</h3>
                      <p className="text-slate-400 text-sm">Can't find the answer you're looking for? Our support team is here to help 24/7.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {}}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Contact Support
                  </button>
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
    </div>
  );
};

export default FAQPage;