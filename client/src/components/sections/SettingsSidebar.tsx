import React from "react";
import { BarChart3, Zap, User, Phone, HelpCircle, Settings, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsSidebarProps {
  activeTab: string;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  activeTab, 
  sidebarOpen, 
  onSidebarToggle 
}) => {
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", icon: <BarChart3 className="w-5 h-5" />, path: "/dashboard" },
    { name: "Opportunities", icon: <Zap className="w-5 h-5" />, path: "/opportunities" },
    { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
    { name: "Contact Support", icon: <Phone className="w-5 h-5" />, path: "/contact-support" },
    { name: "FAQ", icon: <HelpCircle className="w-5 h-5" />, path: "/faq" },
  { name: "About Us", icon: <Info className="w-5 h-5" />, path: "/about-us" },
    { name: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div
      className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                  fixed inset-y-0 left-0 z-[100] w-64 transform 
                  bg-white/95 backdrop-blur-xl border-r border-slate-200/60 
                  transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:transform-none`}
    >
  <div className="flex items-center justify-between gap-3 p-6 border-b border-slate-200/60">
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
          onClick={onSidebarToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

  <div className="p-4">
  <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Main Navigation</div>
        {/* Sidebar Navigation */}
        <nav className="space-y-2">
          {navigation.map(item => (
            <button
              key={item.name}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.name
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-600 border border-cyan-200"
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
