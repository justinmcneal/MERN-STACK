import { useEffect, useState } from "react";
import SettingsLayout from "../components/sections/SettingsLayout";
import SettingsSidebar from "../components/sections/SettingsSidebar";
import SettingsHeader from "../components/sections/SettingsHeader";
import SettingsContent from "../components/sections/SettingsContent";
import { useNotifications } from "../hooks/useNotifications";

const SettingsPage = () => {
  const [activeTab] = useState("Settings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications(10, 60000);

  const toggleNotifications = () => {
    setNotificationOpen(prev => {
      const next = !prev;
      if (next) {
        setProfileDropdownOpen(false);
      }
      return next;
    });
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(prev => {
      const next = !prev;
      if (next) {
        setNotificationOpen(false);
      }
      return next;
    });
  };

  useEffect(() => {
    if (sidebarOpen) {
      setNotificationOpen(false);
      setProfileDropdownOpen(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <SettingsLayout>
      {/* Sidebar */}
      <SettingsSidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:bg-transparent" : ""}`}
        onClick={() => {
          if (sidebarOpen) {
            setSidebarOpen(false);
          }
        }}
      >
          
        {/* Header */}
        <SettingsHeader
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationOpen={notificationOpen}
          onNotificationToggle={toggleNotifications}
          onNotificationClose={() => setNotificationOpen(false)}
          profileDropdownOpen={profileDropdownOpen}
          onProfileDropdownToggle={toggleProfileDropdown}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />

        {/* Settings Content */}
        <SettingsContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </SettingsLayout>
  );
};

export default SettingsPage;