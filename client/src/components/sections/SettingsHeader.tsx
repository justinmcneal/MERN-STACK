import React from "react";
import { createPortal } from "react-dom";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ui/ThemeToggle/ThemeToggle";
import { useThemeClasses } from "../ThemeAware";

interface SettingsHeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  notificationOpen: boolean;
  onNotificationToggle: () => void;
  profileDropdownOpen: boolean;
  onProfileDropdownToggle: () => void;
  notifications: Array<{
    type: string;
    title: string;
    pair?: string;
    target?: string;
    current?: string;
    details?: string;
    profit?: string;
    gas?: string;
    score?: number;
    time: string;
  }>;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onSidebarToggle,
  notificationOpen,
  onNotificationToggle,
  profileDropdownOpen,
  onProfileDropdownToggle,
  notifications
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bg, border, textSecondary } = useThemeClasses();

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
    <header className={`${bg}/50 backdrop-blur border-b ${border}/50 p-4 lg:p-6 z-50`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className={`text-xl font-semibold ${textSecondary}`}>Settings</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notification */}
          <div className="relative">
            <button
              onClick={onNotificationToggle}
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
                  className={`fixed top-[70px] right-0 left-0 sm:right-[260px] sm:left-auto w-full sm:w-96 max-h-[70vh] ${bg}/95 backdrop-blur border ${border}/50 rounded-2xl shadow-xl z-[9999] overflow-hidden flex flex-col`}
                >
                  {/* Header */}
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${border}/50`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.164 6.562 4 9.138 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.862-2.164-5.438-5-5.93V5c0-1.657-1.343-3-3-3zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
                      </svg>
                      <span className="font-semibold ${textSecondary}">Notifications</span>
                    </div>
                    <div className="flex gap-6">
                      <button className={`text-xs ${textSecondary} hover:text-slate-200`}>Mark All Read</button>
                      <button className={`text-xs ${textSecondary} hover:text-slate-200`}>Clear All</button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/50">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex flex-col px-4 py-3 hover:bg-slate-800/30 transition">
                        {n.type === "price" ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className={`${textSecondary} font-medium`}>{n.title}</span>
                              <span className="text-xs text-cyan-400">{n.time}</span>
                            </div>
                            <p className="text-sm text-slate-300 mt-1">{n.pair} reached your target of {n.target}</p>
                            <p className={`text-xs ${textSecondary}`}>Alert set: {n.target} • Current: {n.current}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className={`${textSecondary} font-medium`}>{n.title}</span>
                              <span className="text-xs text-cyan-400">{n.time}</span>
                            </div>
                            <p className="text-sm text-emerald-400 mt-1">{n.details}</p>
                            <p className={`text-xs ${textSecondary}`}>Est. Profit: {n.profit} • Gas: {n.gas} • Score: {n.score}</p>
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
            <div className={`flex items-center gap-3 ${bg}/50 border ${border}/50 rounded-xl px-3 py-2 cursor-pointer z-50`}
                onClick={onProfileDropdownToggle}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className={`text-sm font-medium ${textSecondary}`}>{user?.name || 'User'}</div>
                  <div className={`text-xs ${textSecondary}`}>Pro Trader</div>
                </div>
                <svg className={`w-4 h-4 ${textSecondary} transition-transform duration-200`} style={{transform: profileDropdownOpen?'rotate(180deg)':'rotate(0deg)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
            {profileDropdownOpen &&
            createPortal(
              <div className={`fixed top-[85px] right-[39px] w-44 ${bg}/90 backdrop-blur border ${border}/50 rounded-xl shadow-lg z-50`}>
                <button onClick={() => { navigate("/profile"); onProfileDropdownToggle(); }} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} hover:opacity-90 transition-colors`}>
                  <User className="w-4 h-4 text-cyan-400" /> Profile
                </button>
                <button onClick={() => { handleLogout(); onProfileDropdownToggle(); }} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} hover:opacity-90 transition-colors`}>
                  <LogOut className="w-4 h-4 text-red-400" /> Logout
                </button>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SettingsHeader;
