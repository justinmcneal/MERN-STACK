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
  
  // General Settings - static values
  const [themeMode, setThemeMode] = useState(true); // Static - true = dark, false = light
  const [dataRefreshInterval, setDataRefreshInterval] = useState("Every 30 seconds"); // Static
  const [defaultCurrency, setDefaultCurrency] = useState("Select Currency"); // Static
  
  // Monitoring Settings - static values
  const [minProfitThreshold, setMinProfitThreshold] = useState(1.5); // Static
  const [maxGasFee, setMaxGasFee] = useState(75); // Static

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

  const handleSaveChanges = () => {
    // Static form submission - no actual processing
  };

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
        <SettingsContent
          themeMode={themeMode}
          dataRefreshInterval={dataRefreshInterval}
          defaultCurrency={defaultCurrency}
          onThemeModeChange={() => setThemeMode(!themeMode)}
          onDataRefreshIntervalChange={setDataRefreshInterval}
          onDefaultCurrencyChange={setDefaultCurrency}
          minProfitThreshold={minProfitThreshold}
          maxGasFee={maxGasFee}
          onMinProfitThresholdChange={setMinProfitThreshold}
          onMaxGasFeeChange={setMaxGasFee}
          onSaveChanges={handleSaveChanges}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <style>{`
        .profit-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
        }
        .profit-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
        }
        .profit-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, 
            #1e293b 0%, 
            #ec4899 ${(minProfitThreshold / 10) * 100}%, 
            #334155 ${(minProfitThreshold / 10) * 100}%, 
            #334155 100%
          );
        }
      `}</style>
    </SettingsLayout>
  );
};

export default SettingsPage;