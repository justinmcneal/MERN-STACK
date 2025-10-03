import { useState } from "react";
import { RefreshCw, TrendingUp, Filter } from "lucide-react";
import { Layout } from "../../components/layout";
import { 
  TradingChart, 
  TokenTrendsChart,
  ArbitrageTable,
  StatsGrid
} from "../../components/features";
import { 
  usePageState,
  useOpportunities,
  usePriceData,
  useNotificationState,
  useUserStats
} from "../../hooks";
import { Button, Select } from "../../components/ui";

const OpportunitiesPage = () => {
  // Unified state management using custom hooks
  const pageState = usePageState("Opportunities");
  const userStats = useUserStats();
  const opportunities = useOpportunities({ limit: 20 });
  const priceData = usePriceData({ limit: 10 });
  const notifications = useNotificationState([
    {
      type: "arbitrage",
      title: "High Score Alert",
      details: "ETH arbitrage opportunity detected",
      profit: "$1,234",
      gas: "$25",
      score: 95,
      time: "now",
      unread: true,
    },
    {
      type: "price",
      title: "Price Breakthrough",
      pair: "BTC/USDT",
      target: "$65,000",
      current: "$65,234",
      time: "2m ago",
      unread: false,
    },
  ]);

  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [selectedToken, setSelectedToken] = useState("All Tokens");
  const [minProfit, setMinProfit] = useState(100);
  const [sortBy, setSortBy] = useState("profit");

  const user = {
    name: "John Wayne",
    email: "johnwayne@gmail.com",
  };

  // Convert ArbitrageOpportunity to ArbitrageData format
  const convertedArbitrageData = opportunities.opportunities.map(opp => ({
    token: opp.token,
    from: opp.from,
    to: opp.to,
    priceDiff: opp.priceDiff,
    gasFee: opp.gasFee,
    estProfit: opp.estProfit,
    score: opp.score,
  }));

  const isLoading = userStats.loading || opportunities.loading || priceData.loading;

  if (isLoading) {
    return (
      <Layout
        title="Opportunities"
        activeTab={pageState.activeTab}
        onTabChange={pageState.setActiveTab}
        notifications={notifications.notifications}
        user={user}
        onNotificationClick={(notification) => {
          console.log('Notification clicked:', notification);
          notifications.markAsRead(notification.id!);
        }}
        onMarkAllRead={notifications.markAllAsRead}
        onLogout={() => console.log('Logout')}
      >
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-cyan-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading trading opportunities...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Trading Opportunities"
      activeTab={pageState.activeTab}
      onTabChange={pageState.setActiveTab}
      notifications={notifications.notifications}
      user={user}
      onNotificationClick={(notification) => {
        console.log('Notification clicked:', notification);
        notifications.markAsRead(notification.id!);
      }}
      onMarkAllRead={notifications.markAllAsRead}
      onLogout={() => console.log('Logout')}
    >
      <div className="p-6 space-y-8">
        {/* Stats Overview */}
        <StatsGrid stats={userStats.statsData} />

        {/* Filters and Controls */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              Filter Opportunities
            </h3>
            <Button
              onClick={() => {
                opportunities.refetch();
                priceData.refetch();
              }}
              variant="outline"
              size="sm"
              className="text-emerald-400 border-emerald-400/50 hover:bg-emerald-400/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Timeframe</label>
              <Select
                value={selectedTimeframe}
                onChange={(value) => setSelectedTimeframe(value)}
                options={[
                  { value: "1m", label: "1 Minute" },
                  { value: "5m", label: "5 Minutes" },
                  { value: "1h", label: "1 Hour" },
                  { value: "24h", label: "24 Hours" },
                ]}
                placeholder="Select timeframe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Token</label>
              <Select
                value={selectedToken}
                onChange={(value) => setSelectedToken(value)}
                options={[
                  { value: "All Tokens", label: "All Tokens" },
                  { value: "ETH", label: "Ethereum" },
                  { value: "BTC", label: "Bitcoin" },
                  { value: "USDC", label: "USDC" },
                  { value: "MATIC", label: "Polygon" },
                ]}
                placeholder="Select token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Min Profit ($)</label>
              <input
                type="number"
                value={minProfit}
                onChange={(e) => setMinProfit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-sLate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value)}
                options={[
                  { value: "profit", label: "Profit (High to Low)" },
                  { value: "score", label: "Score (High to Low)" },
                  { value: "token", label: "Token Name" },
                  { value: "gas", label: "Gas Cost (Low to High)" },
                ]}
                placeholder="Sort by"
              />
            </div>
          </div>
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Chart */}
          <div className="lg:col-span-2">
            <TradingChart 
              title="Real-Time Arbitrage Detection"
              subtitle="Live opportunity tracking"
              value="$12,847.32"
              change="+$1,427.45 (12.5%)"
              height="h-80"
            />
          </div>

          {/* Token Trends */}
          <div>
            <TokenTrendsChart />
          </div>
        </div>

        {/* Arbitrage Opportunities Table */}
        <div>
          <ArbitrageTable data={convertedArbitrageData} />
        </div>

        {/* Error States */}
        {(userStats.error || opportunities.error || priceData.error) && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">Data Loading Issues</h4>
            <ul className="text-red-300 text-sm space-y-1">
              {userStats.error && <li>• User stats: {userStats.error}</li>}
              {opportunities.error && <li>• Opportunities: {opportunities.error}</li>}
              {priceData.error && <li>• Price data: {priceData.error}</li>}
            </ul>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Trading Summary
              </h4>
              <p className="text-slateg-400 text-sm">
                Total opportunities found: {opportunities.opportunities.length || 0}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400">
                ${opportunities.opportunities.reduce((sum, opp) => sum + Number(opp.estProfit.replace('$', '')), 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Estimated Total Profit</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OpportunitiesPage;
