import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { TokenProvider } from "../context/TokenContext";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PriceTable from "../components/dashboard/PriceTable";
import StatCardsWrapper from "../components/dashboard/StatCards";
import ChartComponent from "../components/dashboard/ChartComponent";
import ArbitrageTable from "../components/dashboard/ArbitrageTable";
import useOpportunities from "../hooks/useOpportunities";

const Dashboard = () => {
  useAuth();

  const [activeTab] = useState("Dashboard");

  // Price table filtering
  const [priceFilter, setPriceFilter] = useState<'all' | 'byChain' | 'byToken'>('all');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('');

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

  const opportunityQuery = useMemo(
    () => ({ status: 'active', sortBy: 'score', sortOrder: 'desc' as const, limit: 25 }),
    []
  );

  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
    refresh: refreshOpportunities
  } = useOpportunities({ pollIntervalMs: 60000, query: opportunityQuery });

  

  return (
    <TokenProvider pollIntervalMs={60000}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.cyan.900)/10,theme(colors.slate.950),theme(colors.purple.900)/10)]"></div>
        <div className="relative z-50 flex h-screen">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab={activeTab} />

          {/* Main Content */}
          <div
            className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <DashboardHeader
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
              notificationOpen={notificationOpen}
              onNotificationToggle={() => setNotificationOpen(!notificationOpen)}
              profileDropdownOpen={profileDropdownOpen}
              onProfileDropdownToggle={() => setProfileDropdownOpen(!profileDropdownOpen)}
              notifications={notifications as import('../components/dashboard/DashboardHeader').NotificationItem[]}
            />

            {/* Main Dashboard Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              <StatCardsWrapper />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg> Price Table
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPriceFilter('all');
                          setSelectedChain(null);
                          setSelectedToken('');
                        }}
                        className={`px-3 py-1 text-xs rounded-lg ${priceFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50 transition-all`}
                      >
                        All Chains
                      </button>
                      <button
                        onClick={() => {
                          setPriceFilter('byChain');
                          setSelectedToken('');
                        }}
                        className={`px-3 py-1 text-xs rounded-lg ${priceFilter === 'byChain' ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50 transition-all`}
                      >
                        By Chain
                      </button>
                      <button
                        onClick={() => {
                          setPriceFilter('byToken');
                          setSelectedChain(null);
                        }}
                        className={`px-3 py-1 text-xs rounded-lg ${priceFilter === 'byToken' ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50 transition-all`}
                      >
                        By Token
                      </button>
                    </div>
                  </div>
                  <PriceTable
                    filterMode={priceFilter}
                    selectedChain={selectedChain}
                    onSelectChain={setSelectedChain}
                    selectedToken={selectedToken}
                    onSelectToken={setSelectedToken}
                  />
                </div>

                <ArbitrageTable
                  opportunities={opportunities}
                  loading={opportunitiesLoading}
                  error={opportunitiesError}
                  onRefresh={refreshOpportunities}
                />
              </div>

              <ChartComponent />
            </main>
            {notificationOpen && (
              <div
                className="fixed inset-0 bg-black/40 lg:hidden z-40"
                onClick={() => {}}
              />
            )}
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
      </div>
    </TokenProvider>
  );
};

export default Dashboard;
