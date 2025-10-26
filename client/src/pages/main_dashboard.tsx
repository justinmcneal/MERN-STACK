import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../hooks/usePreferences";
import { TokenProvider } from "../context/TokenContext";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PriceTable from "../components/dashboard/PriceTable";
import StatCardsWrapper from "../components/dashboard/StatCards";
import ChartComponent from "../components/dashboard/ChartComponent";
import ArbitrageTable from "../components/dashboard/ArbitrageTable";
import useOpportunities from "../hooks/useOpportunities";
import useAlerts from "../hooks/useAlerts";

const Dashboard = () => {
  useAuth();

  const [activeTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Price table filtering
  const [priceFilter, setPriceFilter] = useState<'all' | 'byChain' | 'byToken'>('all');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('');

  // Get user preferences from settings
  const { preferences } = usePreferences();
  const trackedTokens = useMemo(
    () => (preferences?.tokensTracked ? [...preferences.tokensTracked] : []),
    [preferences]
  );
  const thresholds = preferences?.alertThresholds;

  // ALL polling intervals aligned with server hourly updates (cron jobs run every hour)
  // Server fetches fresh data from external APIs (DexScreener) every hour
  // Polling more frequently than hourly wastes resources since data doesn't update faster
  const pollInterval = 3600000; // 1 hour (3600000ms) for ALL data fetching

  // Memoize alert query to prevent infinite re-renders
  const alertQuery = useMemo(() => ({ limit: 10 }), []);
  
  // Fetch live alerts
  const { alerts } = useAlerts({ pollIntervalMs: pollInterval, query: alertQuery });

  // Fetch live opportunities with user preferences
  const opportunityQuery = useMemo(() => {
    if (!preferences || !thresholds) {
      return { status: 'active', sortBy: 'score', sortOrder: 'desc' as const, limit: 25 };
    }

    // Apply user's alert thresholds from settings
    return {
      status: 'active',
      sortBy: 'score',
      sortOrder: 'desc' as const,
      limit: 25,
      minProfit: thresholds.minProfit,
      maxGasCost: thresholds.maxGasCost,
      minROI: thresholds.minROI,
      minScore: thresholds.minScore
    };
  }, [preferences, thresholds]);

  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
    refresh: refreshOpportunities
  } = useOpportunities({ pollIntervalMs: pollInterval, query: opportunityQuery });

  // Calculate stats from opportunities
  const stats = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return { bestOpportunity: null, topToken: null };
    }

    // Filter opportunities based on user's tracked tokens if set
    let filteredOpportunities = opportunities;
    if (trackedTokens.length > 0) {
      filteredOpportunities = opportunities.filter(opp =>
        trackedTokens.includes(opp.tokenSymbol.toUpperCase())
      );
    }

    // If no opportunities after filtering, return empty stats
    if (filteredOpportunities.length === 0) {
      return { bestOpportunity: null, topToken: null };
    }

    const safeOpportunities = filteredOpportunities.filter(opp => !opp.flagged);
    const opportunitiesForStats = safeOpportunities.length > 0 ? safeOpportunities : filteredOpportunities;

    // Best opportunity (highest net profit)
    const bestOpp = [...opportunitiesForStats].sort((a, b) => b.netProfitUsd - a.netProfitUsd)[0];

    // Calculate average spread per token
    const tokenStats = new Map<string, { spreads: number[]; chains: Set<string> }>();
    opportunitiesForStats.forEach(opp => {
      const symbol = opp.tokenSymbol;
      if (!tokenStats.has(symbol)) {
        tokenStats.set(symbol, { spreads: [], chains: new Set() });
      }
      const stats = tokenStats.get(symbol)!;
      if (opp.priceDiffPercent) stats.spreads.push(opp.priceDiffPercent);
      stats.chains.add(opp.chainFrom);
      stats.chains.add(opp.chainTo);
    });

    // Find token with highest average spread
    let topToken = null;
    let maxAvgSpread = 0;
    tokenStats.forEach((stats, symbol) => {
      if (stats.spreads.length > 0) {
        const avgSpread = stats.spreads.reduce((a, b) => a + b, 0) / stats.spreads.length;
        if (avgSpread > maxAvgSpread) {
          maxAvgSpread = avgSpread;
          topToken = { symbol, avgSpread, chains: Array.from(stats.chains) };
        }
      }
    });

    return {
      bestOpportunity: bestOpp ? {
        tokenSymbol: bestOpp.tokenSymbol,
        priceDiffPercent: bestOpp.priceDiffPercent,
        netProfitUsd: bestOpp.netProfitUsd,
        chainFrom: bestOpp.chainFrom,
        chainTo: bestOpp.chainTo
      } : null,
      topToken
    };
  }, [opportunities, trackedTokens]);

  return (
    <TokenProvider pollIntervalMs={pollInterval}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.cyan.900)/10,theme(colors.slate.950),theme(colors.purple.900)/10)]"></div>
        
        <div className="relative z-50 flex h-screen">
          {/* Sidebar */}
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            activeTab={activeTab} 
          />

          {/* Main Content */}
          <div
            className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            {/* Header */}
            <DashboardHeader
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
              notificationOpen={notificationOpen}
              onNotificationToggle={() => setNotificationOpen(!notificationOpen)}
              profileDropdownOpen={profileDropdownOpen}
              onProfileDropdownToggle={() => setProfileDropdownOpen(!profileDropdownOpen)}
              notifications={
                preferences?.notificationSettings?.dashboard 
                  ? (alerts as import('../components/dashboard/DashboardHeader').NotificationItem[])
                  : []
              }
            />

            {/* Main Dashboard Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {/* User Preferences Info Banner */}
              {trackedTokens.length > 0 && thresholds && (
                <div className="mb-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-cyan-300 text-sm">
                      Tracking {trackedTokens.length} token(s): {trackedTokens.join(', ')} | 
                      Min Profit: ${thresholds.minProfit} | 
                      Max Gas: ${thresholds.maxGasCost}
                    </p>
                  </div>
                </div>
              )}

              <StatCardsWrapper 
                bestOpportunity={stats.bestOpportunity}
                topToken={stats.topToken}
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      Price Table
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
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </TokenProvider>
  );
};

export default Dashboard;
