import { LogOut, User, Download } from "lucide-react";
import { createPortal } from "react-dom";
import type { NotificationItem } from "./types";
import { downloadArbitrageDataCSV } from "../../utils/exportData";

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

type OpportunitiesHeaderProps = {
  title: string;
  notifications: (NotificationItem & { id: string, isRead: boolean })[];
  notificationOpen: boolean;
  onNotificationToggle: () => void;
  onNotificationClose: () => void;
  profileDropdownOpen: boolean;
  onProfileDropdownToggle: () => void;
  onProfileDropdownClose: () => void;
  onSidebarToggle: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => Promise<void> | void;
  userName?: string | null;
  unreadCount?: number;
  onMarkAsRead?: (alertIds: string[]) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
};

const OpportunitiesHeader: React.FC<OpportunitiesHeaderProps> = ({
  title,
  notifications,
  notificationOpen,
  onNotificationToggle,
  onNotificationClose,
  profileDropdownOpen,
  onProfileDropdownToggle,
  onProfileDropdownClose,
  onSidebarToggle,
  onNavigate,
  onLogout,
  userName,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const displayName = userName || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const displayCount = unreadCount ?? notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notificationId: string) => {
    console.log('🔔 Notification clicked, ID:', notificationId);
    if (onMarkAsRead) {
      console.log('📨 Calling onMarkAsRead function');
      onMarkAsRead([notificationId]);
    } else {
      console.error('❌ onMarkAsRead function not provided!');
    }
  };

  const handleMarkAllAsRead = () => {
    console.log('🔔 Mark All Read button clicked');
    if (onMarkAllAsRead) {
      console.log('📨 Calling onMarkAllAsRead function');
      onMarkAllAsRead();
    } else {
      console.error('❌ onMarkAllAsRead function not provided!');
    }
  };

  const handleClearAll = () => {
    console.log('🗑️ Clear All button clicked');
    if (onClearAll) {
      console.log('📨 Calling onClearAll function');
      onClearAll();
    } else {
      console.error('❌ onClearAll function not provided!');
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
    } finally {
      onProfileDropdownClose();
    }
  };

  const handleExportData = () => {
    try {
      downloadArbitrageDataCSV();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800/50 p-4 lg:p-6 relative z-30">
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
          <h1 className="text-xl font-semibold text-slate-200">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/50 transition"
            title="Export Data as CSV"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="relative">
            <button
              onClick={onNotificationToggle}
              className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all"
            >
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.164 6.562 4 9.138 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.862-2.164-5.438-5-5.93V5c0-1.657-1.343-3-3-3zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
              </svg>
              {displayCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {displayCount}
                </div>
              )}
            </button>

            {notificationOpen && isBrowser &&
              createPortal(
                <div className="fixed top-[70px] right-0 left-0 sm:right-[260px] sm:left-auto w-full sm:w-96 max-h-[70vh] bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-2xl shadow-xl z-[9999] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.164 6.562 4 9.138 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.862-2.164-5.438-5-5.93V5c0-1.657-1.343-3-3-3zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
                      </svg>
                      <span className="font-semibold text-slate-200">Notifications</span>
                    </div>
                    <div className="flex gap-6">
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Mark All Read
                      </button>
                      <button 
                        onClick={handleClearAll}
                        className="text-xs text-slate-400 hover:text-red-400"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div 
                          key={`${n.id}-${i}`} 
                          className={`flex flex-col px-4 py-3 hover:bg-slate-800/30 transition cursor-pointer ${
                            !n.isRead ? 'bg-slate-800/20' : ''
                          }`}
                          onClick={() => handleNotificationClick(n.id)}
                        >
                          {n.type === "price" ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-200 font-medium">{n.title}</span>
                                <span className="text-xs text-cyan-400">{n.time}</span>
                              </div>
                            <p className="text-sm text-slate-300 mt-1">
                              {n.pair} reached your target of {n.target}
                            </p>
                            <p className="text-xs text-slate-400">
                              Alert set: {n.target} - Current: {n.current}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-200 font-medium">{n.title}</span>
                              <span className="text-xs text-cyan-400">{n.time}</span>
                            </div>
                            <p className="text-sm text-emerald-400 mt-1">{n.details}</p>
                            <p className="text-xs text-slate-400">
                              Est. Profit: {n.profit} - Gas: {n.gas} - Score: {n.score}
                            </p>
                          </>
                        )}
                      </div>
                    ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onNotificationClose();
                      onNavigate("/all-notifications");
                    }}
                    className="w-full py-3 text-center text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition"
                  >
                    View All Notifications
                  </button>
                </div>,
                document.body
              )}
          </div>

          <div className="relative z-50">
            <div
              className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 cursor-pointer"
              onClick={onProfileDropdownToggle}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{userInitial}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{displayName}</div>
                <div className="text-xs text-slate-400">Pro Trader</div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 transition-transform duration-200"
                style={{ transform: profileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {profileDropdownOpen && isBrowser &&
              createPortal(
                <div className="fixed top-[85px] right-[40px] w-44 bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-lg z-[9999]">
                  <button
                    onClick={() => {
                      onNavigate("/profile");
                      onProfileDropdownClose();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Logout
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

export default OpportunitiesHeader;
