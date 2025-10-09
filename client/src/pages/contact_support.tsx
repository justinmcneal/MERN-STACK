import { useState } from "react";
import { BarChart3, Zap, User,  HelpCircle, Settings, LogOut, Mail, MessageSquare, Phone, Clock, BookOpen, Send, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";

const ContactSupportPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("Contact Support");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    
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
    
    // Form states
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priorityLevel, setPriorityLevel] = useState("Low");

    const navigation = [
        { name: "Dashboard", icon: <BarChart3 className="w-5 h-5 text-white" />, path: "/dashboard" },
        { name: "Opportunities", icon: <Zap className="w-5 h-5 text-white" />, path: "/opportunities" },
        { name: "Profile", icon: <User className="w-5 h-5 text-white" />, path: "/profile" },
        { name: "Contact Support", icon: <Phone className="w-5 h-5 text-white" /> },
        { name: "FAQ", icon: <HelpCircle className="w-5 h-5 text-white" />, path: "/faq" },
        { name: "About Us", icon: <Info className="w-5 h-5 text-white" /> , path: "/about us" },
        { name: "Settings", icon: <Settings className="w-5 h-5 text-white" />, path: "/settings" }
        ];

// Static navigation - no functions needed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static form submission - no actual processing
  };

  const ContactInfoCard = ({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) => (
    <div className="p-6 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/40 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-slate-200 font-semibold mb-1">{title}</h3>
          <p className="text-slate-400 text-sm mb-2">{description}</p>
          {link && (
            <a href="#" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
              {link}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const PriorityButton = ({ level, selected, onClick }: { level: string, selected: boolean, onClick: () => void }) => {
    const colors = {
      Low: "from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400",
      Medium: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400",
      High: "from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-400"
    };
    
    const selectedColors = {
      Low: "from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25",
      Medium: "from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25",
      High: "from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25"
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
          selected 
            ? `bg-gradient-to-r ${selectedColors[level as keyof typeof selectedColors]}` 
            : `bg-gradient-to-r ${colors[level as keyof typeof colors]} border hover:scale-105`
        }`}
      >
        {level}
      </button>
    );
  };

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
            onClick={() => setSidebarOpen(false)}
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
        <div className={`flex-1 overflow-y-auto transition-all duration-300
              ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
        onClick={() => sidebarOpen && setSidebarOpen(false)} >
          
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
                <h1 className="text-xl font-semibold text-slate-200">Contact Support</h1>
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
                                onClick={()=>setProfileDropdownOpen(!profileDropdownOpen)}>
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

          {/* Contact Support Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                <span className="text-white">Contact </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Support</span>
              </h1>
              <p className="text-slate-400 max-w-3xl mx-auto">
                Get expert help from our crypto arbitrage support team. We're here 24/7 to assist you with technical issues, monitoring questions, and platform guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-slate-200 mb-6">Contact Information</h2>
                
                <div className="space-y-4">
                  <ContactInfoCard
                    icon={<Mail className="w-6 h-6 text-cyan-400" />}
                    title="Email Support"
                    description="arbitragepro@gmail.com" link="mailto:arbitragepro@gmail.com"
                  />
                  
                  <ContactInfoCard
                    icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
                    title="Live Chat"
                    description="Available 24/7 in dashboard" link="https://chat.arbitragepro.com"
                  />
                  
                  <ContactInfoCard
                    icon={<Phone className="w-6 h-6 text-emerald-400" />}
                    title="Phone Support"
                    description="+1 (555) 123-4881" link="tel:+15551234881"
                  />
                  
                  <ContactInfoCard
                        icon={<Clock className="w-6 h-6 text-yellow-400" />}
                        title="Response Time"
                        description="< 2 hours average" link="https://docs.arbitragepro.com"                  
                    />
                  
                  <ContactInfoCard
                    icon={<BookOpen className="w-6 h-6 text-pink-400" />}
                    title="Help Center"
                    description="docs.arbitrage.pro"
                    link="docs.arbitrage.pro"
                  />
                </div>
              </div>

              {/* Get in Touch Form */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-slate-200 mb-6">Get in Touch</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g 094527688976"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter your subject"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Priority Level */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-3">Priority Level</label>
                    <div className="flex flex-wrap gap-3">
                      <PriorityButton 
                        level="Low" 
                        selected={priorityLevel === "Low"}
                        onClick={() => setPriorityLevel("Low")}
                      />
                      <PriorityButton 
                        level="Medium" 
                        selected={priorityLevel === "Medium"}
                        onClick={() => setPriorityLevel("Medium")}
                      />
                      <PriorityButton 
                        level="High" 
                        selected={priorityLevel === "High"}
                        onClick={() => setPriorityLevel("High")}
                      />
                    </div>
                  </div>

                  {/* Your Message */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your issue or question in detail. Include any error messages, steps to reproduce, and relevant account information..."
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Additional Info Banner */}
            <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">Need Immediate Assistance?</h3>
                    <p className="text-slate-400 text-sm">Our live chat support is available 24/7 directly in your dashboard for instant help with urgent issues.</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Open Live Chat
                </button>
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
    </div>
  );
};

export default ContactSupportPage;