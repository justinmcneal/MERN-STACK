import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Zap, 
  User, 
  Phone, 
  HelpCircle, 
  Settings, 
  Info,
  X
} from 'lucide-react';

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation: NavigationItem[] = [
    { 
      name: "Dashboard", 
      icon: <BarChart3 className="w-5 h-5 text-white" />, 
      path: "/dashboard" 
    },
    { 
      name: "Opportunities", 
      icon: <Zap className="w-5 h-5 text-white" />, 
      path: "/opportunities" 
    },
    { 
      name: "Profile", 
      icon: <User className="w-5 h-5 text-white" />, 
      path: "/profile" 
    },
    { 
      name: "Contact Support", 
      icon: <Phone className="w-5 h-5 text-white" />, 
      path: "/contact-support" 
    },
    { 
      name: "FAQ", 
      icon: <HelpCircle className="w-5 h-5 text-white" />, 
      path: "/faq" 
    },
    { 
      name: "About Us", 
      icon: <Info className="w-5 h-5 text-white" />, 
      path: "/about-us" 
    },
    { 
      name: "Settings", 
      icon: <Settings className="w-5 h-5 text-white" />, 
      path: "/settings" 
    }
  ];

  const handleNavigation = (item: NavigationItem) => {
    if (item.path) {
      navigate(item.path);
      onTabChange(item.name);
    }
    if (item.onClick) {
      item.onClick();
    }
    onClose();
  };

  const isActive = (itemName: string) => {
    return activeTab === itemName || location.pathname === navigation.find(nav => nav.name === itemName)?.path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="text-2xl font-bold">
            <span className="text-cyan-400">ArbiTrage</span>
            <span className="text-purple-400 ml-1">Pro</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                ${isActive(item.name)
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 text-center">
            © 2024 ArbiTrage Pro
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
