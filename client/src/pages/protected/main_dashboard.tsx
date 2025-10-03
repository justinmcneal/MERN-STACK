import { RefreshCw } from 'lucide-react';
import { Layout } from '../../components/layout';
import { 
  StatsGrid, 
  PriceDataTable, 
  ArbitrageTable, 
  TokenTrendsChart 
} from '../../components/features';
import { 
  usePageState, 
  useUserStats, 
  useOpportunities, 
  usePriceData,
  useNotificationState 
} from '../../hooks';

const MainDashboardUnified = () => {
  // Unified state management using custom hooks
  const pageState = usePageState("Dashboard");
  const userStats = useUserStats();
  const opportunities = useOpportunities({ limit: 6 });
  const priceData = usePriceData({ limit: 6 });
  const notifications = useNotificationState([
    {
      type: "price",
      title: "Price Target Hit",
      pair: "ETH/USDT",
      target: "$0.45",
      current: "$0.4523",
      time: "now",
      unread: false,
    },
    {
      type: "arbitrage",
      title: "New Arbitrage Alert",
      details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
      profit: "$567",
      gas: "$15",
      score: 91,
      time: "now",
      unread: true,
    },
  ]);

  const user = {
    name: "John Wayne",
    email: "johnwayne@gmail.com",
  };

  // Convert TokenPrice to PriceData format for existing components
  const convertedPriceData = priceData.prices.map(price => ({
    token: price.token,
    chain: price.chain,
    currentPrice: price.currentPrice,
    lastUpdated: price.lastUpdated,
  }));

  // Convert ArbitrageOpportunity to ArbitrageData format for existing components
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
        title="Dashboard"
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
        <div className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <h3 className="text-xl text-slate-300 mb-2">Loading Dashboard</h3>
              <p className="text-slate-400">Fetching the latest data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
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
        {/* Stats Grid */}
        <StatsGrid stats={userStats.statsData} />

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Trends Chart */}
          <div className="lg:col-span-2">
            <TokenTrendsChart />
          </div>

          {/* Price Data Table */}
          <PriceDataTable data={convertedPriceData} />

          {/* Arbitrage Table */}
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

        {/* Refresh Controls */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              userStats.refetch();
              opportunities.refetch();
              priceData.refetch();
            }}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800/70 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All Data
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MainDashboardUnified;
