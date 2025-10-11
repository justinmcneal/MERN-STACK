import { useState } from "react";
import SettingsLayout from "../components/sections/SettingsLayout";
import SettingsSidebar from "../components/sections/SettingsSidebar";
import SettingsHeader from "../components/sections/SettingsHeader";
import SettingsContent from "../components/sections/SettingsContent";

const SettingsPage = () => {
    const [activeTab] = useState("Settings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

    const notifications = [
        {
            type: "price",
            title: "Price Target Hit",
            pair: "ETH/USDT",
            target: "$0.45",
            current: "$0.4523",
            time: "now",
        },
        {
            type: "arbitrage",
            title: "New Arbitrage Alert",
            details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
            profit: "$567",
            gas: "$15",
            score: 91,
            time: "now",
        },
        {
            type: "price",
            title: "Price Target Hit",
            pair: "ETH/USDT",
            target: "$0.45",
            current: "$0.4523",
            time: "36m ago",
        },
        {
            type: "arbitrage",
            title: "New Arbitrage Alert",
            details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
            profit: "$567",
            gas: "$15",
            score: 91,
            time: "1h ago",
        },
    ];

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
              ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
      onClick={() => setSidebarOpen(false)} >
          
          {/* Header */}
        <SettingsHeader
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationOpen={notificationOpen}
          onNotificationToggle={() => setNotificationOpen(!notificationOpen)}
          profileDropdownOpen={profileDropdownOpen}
          onProfileDropdownToggle={() => setProfileDropdownOpen(!profileDropdownOpen)}
          notifications={notifications}
        />

          {/* Settings Content */}
        <SettingsContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </SettingsLayout>
  );
};

export default SettingsPage;