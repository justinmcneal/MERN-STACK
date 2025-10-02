import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { type Notification } from '../NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  notifications?: Notification[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onLogout?: () => void;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  activeTab = '',
  onTabChange = () => {},
  notifications = [],
  user,
  onNotificationClick,
  onMarkAllRead,
  onLogout,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/10"></div>
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            title={title}
            notifications={notifications}
            user={user}
            onNotificationClick={onNotificationClick}
            onMarkAllRead={onMarkAllRead}
            onLogout={onLogout}
          />

          {/* Page Content */}
          <main className={`flex-1 overflow-auto ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
