import { useMemo, useState } from "react";
import { useAlerts } from "../hooks/useAlerts";
import SettingsLayout from "../components/sections/SettingsLayout";
import SettingsSidebar from "../components/sections/SettingsSidebar";
import SettingsHeader from "../components/sections/SettingsHeader";
import SettingsContent from "../components/sections/SettingsContent";

const SettingsPage = () => {
  const [activeTab] = useState("Settings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Fetch live alerts for notifications
  const alertQuery = useMemo(() => ({ limit: 10 }), []);
  const { alerts } = useAlerts({ pollIntervalMs: 60000, query: alertQuery });

  return (
    <SettingsLayout>
      {/* Sidebar */}
      <SettingsSidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300
        ${sidebarOpen ? "fixed inset-0 z-40 lg:static" : ""}`}
        onClick={() => setSidebarOpen(false)} >
          
        {/* Header */}
        <SettingsHeader
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationOpen={notificationOpen}
          onNotificationToggle={() => setNotificationOpen(!notificationOpen)}
          profileDropdownOpen={profileDropdownOpen}
          onProfileDropdownToggle={() => setProfileDropdownOpen(!profileDropdownOpen)}
          notifications={alerts}
        />

        {/* Settings Content */}
        <SettingsContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </SettingsLayout>
  );
};

export default SettingsPage;