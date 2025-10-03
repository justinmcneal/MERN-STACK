import React, { useState } from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import NotificationDropdown, { type Notification } from '../NotificationDropdown';
import ProfileDropdown from '../ProfileDropdown';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  notifications?: Notification[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  title,
  notifications = [],
  user,
  onNotificationClick,
  onMarkAllRead,
  onLogout
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          
          {title && (
            <h1 className="text-xl font-semibold text-white hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <NotificationDropdown
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onMarkAllRead={onMarkAllRead}
            />
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-xs">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            <ProfileDropdown
              isOpen={profileOpen}
              onClose={() => setProfileOpen(false)}
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
