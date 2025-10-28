import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Sidebar from "../components/dashboard/Sidebar";
import OpportunitiesHeader from "../components/opportunities/OpportunitiesHeader";
import OpportunitiesMainContent from "../components/opportunities/OpportunitiesMainContent";
import RangeSliderStyles from "../components/opportunities/RangeSliderStyles";
import type { NotificationItem, OpportunityItem } from "../components/opportunities/types";
import { useAuth } from "../context/AuthContext";

const NOTIFICATIONS: NotificationItem[] = [
  {
    type: "price",
    title: "Price Target Hit",
    pair: "ETH/XRP",
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
    pair: "ETH/XRP",
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

const OPPORTUNITIES: OpportunityItem[] = [
  { token: "ETH", from: "Ethereum", to: "Polygon", priceDiff: "+2.5%", estProfit: "$50", roi: "95%", color: "emerald" },
  { token: "XRP", from: "BSC", to: "Polygon", priceDiff: "+1.8%", estProfit: "$45", roi: "85%", color: "emerald" },
  { token: "SOL", from: "Ethereum", to: "BSC", priceDiff: "+2.1%", estProfit: "$60", roi: "88%", color: "emerald" },
  { token: "BNB", from: "BSC", to: "Ethereum", priceDiff: "+3.2%", estProfit: "$120", roi: "91%", color: "emerald" },
  { token: "MATIC", from: "Polygon", to: "Ethereum", priceDiff: "+2.8%", estProfit: "$20", roi: "87%", color: "emerald" },
  { token: "DOT", from: "Polkadot", to: "Solana", priceDiff: "+1.4%", estProfit: "$105", roi: "76%", color: "yellow" },
];

const TOKEN_FILTER_OPTIONS = ["All Tokens", "BTC", "ETH", "BNB", "MATIC", "XRP", "SOL"];
const CHAIN_FILTER_OPTIONS = ["All Chain Pairs", "Ethereum → Polygon", "BSC → Ethereum", "Polygon → BSC"];

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const toggleNotifications = () => {
    setNotificationOpen((prev) => {
      const next = !prev;
      if (next) {
        setProfileDropdownOpen(false);
      }
      return next;
    });
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => {
      const next = !prev;
      if (next) {
        setNotificationOpen(false);
      }
      return next;
    });
  };

  return (
    <DashboardLayout>
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab="Opportunities" 
      />

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:bg-transparent lg:backdrop-blur-none" : ""
        }`}
        onClick={() => {
          if (sidebarOpen) {
            setSidebarOpen(false);
          }
        }}
      >
        {/* Header */}
        <OpportunitiesHeader
          title="Opportunities"
          notifications={NOTIFICATIONS}
          notificationOpen={notificationOpen}
          onNotificationToggle={toggleNotifications}
          onNotificationClose={() => setNotificationOpen(false)}
          profileDropdownOpen={profileDropdownOpen}
          onProfileDropdownToggle={toggleProfileDropdown}
          onProfileDropdownClose={() => setProfileDropdownOpen(false)}
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userName={user?.name}
        />

        {/* Main Opportunities Content */}
        <OpportunitiesMainContent
          opportunities={OPPORTUNITIES}
          tokenOptions={TOKEN_FILTER_OPTIONS}
          chainOptions={CHAIN_FILTER_OPTIONS}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Range Slider Styles */}
      <RangeSliderStyles />
    </DashboardLayout>
  );
};

export default OpportunitiesPage;