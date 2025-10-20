import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import OpportunitiesHeader from "../components/opportunities/OpportunitiesHeader";
import OpportunitiesHero from "../components/opportunities/OpportunitiesHero";
import OpportunitiesFilters from "../components/opportunities/OpportunitiesFilters";
import OpportunitiesTable from "../components/opportunities/OpportunitiesTable";
import OpportunitiesChart from "../components/opportunities/OpportunitiesChart";
import RangeSliderStyles from "../components/opportunities/RangeSliderStyles";
import type { NotificationItem, OpportunityItem } from "../components/opportunities/types";
import { useAuth } from "../context/AuthContext";

const NOTIFICATIONS: NotificationItem[] = [
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

const OPPORTUNITIES: OpportunityItem[] = [
  { token: "ETH", from: "Ethereum", to: "Polygon", priceDiff: "+2.5%", estProfit: "$50", roi: "95%", color: "emerald" },
  { token: "USDT", from: "BSC", to: "Polygon", priceDiff: "+1.8%", estProfit: "$45", roi: "85%", color: "emerald" },
  { token: "USDC", from: "Ethereum", to: "BSC", priceDiff: "+2.1%", estProfit: "$60", roi: "88%", color: "emerald" },
  { token: "BNB", from: "BSC", to: "Ethereum", priceDiff: "+3.2%", estProfit: "$120", roi: "91%", color: "emerald" },
  { token: "MATIC", from: "Polygon", to: "Ethereum", priceDiff: "+2.8%", estProfit: "$20", roi: "87%", color: "emerald" },
  { token: "DOT", from: "Polkadot", to: "Solana", priceDiff: "+1.4%", estProfit: "$105", roi: "76%", color: "yellow" },
];

const TOKEN_FILTER_OPTIONS = ["All Tokens", "BTC", "ETH", "BNB", "MATIC", "USDT"];
const CHAIN_FILTER_OPTIONS = ["All Chain Pairs", "Ethereum → Polygon", "BSC → Ethereum", "Polygon → BSC"];
const TABLE_VIEW_OPTIONS = ["By Profit", "By Token", "ROI"];

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1h" | "24h" | "7d">("1h");
  const [selectedToken, setSelectedToken] = useState(TOKEN_FILTER_OPTIONS[0]);
  const [selectedChainPair, setSelectedChainPair] = useState(CHAIN_FILTER_OPTIONS[0]);
  const [minProfit, setMinProfit] = useState(1);
  const [activeView, setActiveView] = useState(TABLE_VIEW_OPTIONS[0]);

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

  const handleResetFilters = () => {
    setSelectedToken(TOKEN_FILTER_OPTIONS[0]);
    setSelectedChainPair(CHAIN_FILTER_OPTIONS[0]);
    setMinProfit(1);
    setSelectedTimeframe("1h");
    setActiveView(TABLE_VIEW_OPTIONS[0]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-cyan-900/10" />

      <div className="relative z-50 flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab="Opportunities" />

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

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <OpportunitiesHero />

            <OpportunitiesFilters
              selectedToken={selectedToken}
              onTokenChange={setSelectedToken}
              selectedChainPair={selectedChainPair}
              onChainPairChange={setSelectedChainPair}
              minProfit={minProfit}
              onMinProfitChange={setMinProfit}
              tokenOptions={TOKEN_FILTER_OPTIONS}
              chainOptions={CHAIN_FILTER_OPTIONS}
              onReset={handleResetFilters}
            />

            <OpportunitiesTable
              opportunities={OPPORTUNITIES}
              activeView={activeView}
              onViewChange={setActiveView}
              viewOptions={TABLE_VIEW_OPTIONS}
            />

            <OpportunitiesChart
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={(timeframe) => setSelectedTimeframe(timeframe)}
              selectedToken={selectedToken}
              onTokenChange={setSelectedToken}
            />
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <RangeSliderStyles />
    </div>
  );
};

export default OpportunitiesPage;