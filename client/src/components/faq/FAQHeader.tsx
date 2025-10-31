import { createPortal } from "react-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import type { FAQNotification } from "./constants";

interface FAQHeaderProps {
  isAuthenticated?: boolean;
  onSidebarToggle: () => void;
  notificationOpen: boolean;
  onNotificationToggle: () => void;
  profileDropdownOpen: boolean;
  onProfileDropdownToggle: () => void;
  notifications: (FAQNotification & { id: string, isRead: boolean })[];
  userName?: string | null;
  onNavigate: (path: string) => void;
  onLogout: () => Promise<void>;
  unreadCount?: number;
  onMarkAsRead?: (alertIds: string[]) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const FAQHeader = ({
  isAuthenticated = true,
  onSidebarToggle,
  notificationOpen,
  onNotificationToggle,
  profileDropdownOpen,
  onProfileDropdownToggle,
  notifications,
  userName,
  onNavigate,
  onLogout,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: FAQHeaderProps) => {
  const initial = userName?.charAt(0).toUpperCase() ?? "U";
  const displayCount = unreadCount ?? notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notificationId: string) => {
    console.log("[notifications] FAQ notification clicked", notificationId);
    if (onMarkAsRead) {
      console.log("[notifications] Calling onMarkAsRead from FAQ header");
      onMarkAsRead([notificationId]);
    } else {
      console.error("[notifications] onMarkAsRead handler missing in FAQ header");
    }
  };

  const handleMarkAllAsRead = () => {
    console.log("[notifications] FAQ mark-all button clicked");
    if (onMarkAllAsRead) {
      console.log("[notifications] Calling onMarkAllAsRead from FAQ header");
      onMarkAllAsRead();
    } else {
      console.error("[notifications] onMarkAllAsRead handler missing in FAQ header");
    }
  };

  const handleClearAll = () => {
    console.log("[notifications] FAQ clear-all button clicked");
    if (onClearAll) {
      console.log("[notifications] Calling onClearAll from FAQ header");
      onClearAll();
    } else {
      console.error("[notifications] onClearAll handler missing in FAQ header");
    }
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800/50 p-4 lg:p-6 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-200">FAQs</h1>
        </div>

        <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={onNotificationToggle}
                    className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all"
                    aria-label="Toggle notifications"
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
                  {notificationOpen &&
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
                            notifications.map((notification, index) => (
                              <div 
                                key={`${notification.id}-${index}`} 
                                className={`flex flex-col px-4 py-3 hover:bg-slate-800/30 transition cursor-pointer ${
                                  !notification.isRead ? 'bg-slate-800/20' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification.id)}
                              >
                              {notification.type === "price" ? (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-200 font-medium">{notification.title}</span>
                                    <span className="text-xs text-cyan-400">{notification.time}</span>
                                  </div>
                                  <p className="text-sm text-slate-300 mt-1">
                                    {notification.pair} reached your target of {notification.target}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Alert set: {notification.target} • Current: {notification.current}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-200 font-medium">{notification.title}</span>
                                    <span className="text-xs text-cyan-400">{notification.time}</span>
                                  </div>
                                  <p className="text-sm text-emerald-400 mt-1">{notification.details}</p>
                                  <p className="text-xs text-slate-400">
                                    Est. Profit: {notification.profit} • Gas: {notification.gas} • Score: {notification.score}
                                  </p>
                                </>
                              )}
                            </div>
                          ))
                          )}
                        </div>
                        <button
                          onClick={() => {
                            onNotificationToggle();
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
                  <button
                    className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 cursor-pointer"
                    onClick={onProfileDropdownToggle}
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{initial}</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-slate-200">{userName ?? "User"}</div>
                      <div className="text-xs text-slate-400">Pro Trader</div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : "rotate-0"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {profileDropdownOpen &&
                    createPortal(
                      <div className="fixed top-[85px] right-[39px] w-44 bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-lg z-50">
                        <button
                          onClick={() => {
                            onNavigate("/profile");
                            onProfileDropdownToggle();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-cyan-400" /> Profile
                        </button>
                        <button
                          onClick={async () => {
                            await onLogout();
                            onProfileDropdownToggle();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" /> Logout
                        </button>
                      </div>,
                      document.body
                    )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-slate-200 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => onNavigate("/register")}
                  className="px-4 py-2 text-sm font-medium text-black bg-cyan-400 rounded-lg hover:bg-cyan-300 transition"
                >
                  Get started
                </button>
              </>
            )}
        </div>
      </div>
    </header>
  );
};

export default FAQHeader;
