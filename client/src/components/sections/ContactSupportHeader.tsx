import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ContactSupportHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileDropdownOpen: boolean;
  setProfileDropdownOpen: (open: boolean) => void;
}

const ContactSupportHeader = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  profileDropdownOpen, 
  setProfileDropdownOpen 
}: ContactSupportHeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Logging out user:', user?.name);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
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
  );
};

export default ContactSupportHeader;
