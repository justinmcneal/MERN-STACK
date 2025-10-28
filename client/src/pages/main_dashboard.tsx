import { useEffect, useMemo, useState } from "react";
import { usePreferences } from "../hooks/usePreferences";
import { TokenProvider } from "../context/TokenContext";
import useTokenContext from "../context/useTokenContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardMainContent from "../components/dashboard/DashboardMainContent";
import useOpportunities from "../hooks/useOpportunities";
import { useCurrencyFormatter, type SupportedCurrency } from "../hooks/useCurrencyFormatter";
import { useNotifications } from "../hooks/useNotifications";

const DashboardContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Get token data for unique count
  const { tokens } = useTokenContext();
  const uniqueTokensInDb = useMemo(() => {
    if (!tokens || tokens.length === 0) return 0;
    return new Set(tokens.map((t: {symbol: string}) => t.symbol.toUpperCase())).size;
  }, [tokens]);

  // Get user preferences from settings
  const { preferences } = usePreferences();
  const currencyPreference = (preferences?.currency ?? 'USD') as SupportedCurrency;
  const { formatCurrency, convertFromUsd } = useCurrencyFormatter(currencyPreference);
  const thresholds = preferences?.alertThresholds;

  // ALL polling intervals aligned with server hourly updates (cron jobs run every hour)
  // Server fetches fresh data from external APIs (DexScreener) every hour
  // Polling more frequently than hourly wastes resources since data doesn't update faster
  const pollInterval = 3600000; // 1 hour (3600000ms) for ALL data fetching

  // Fetch live notifications shared across dashboard headers
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications(10, pollInterval);

  // Fetch live opportunities with user preferences
  const opportunityQuery = useMemo(() => {
    if (!preferences || !thresholds) {
      return { status: 'active', sortBy: 'score', sortOrder: 'desc' as const, limit: 25 };
    }

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

  // Calculate stats from ALL opportunities (not filtered by user preferences)
  // This gives accurate "best opportunity" regardless of user's tracking settings
  const stats = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return { bestOpportunity: null, topToken: null };
    }

    const safeOpportunities = opportunities.filter(opp => !opp.flagged);
    const opportunitiesForStats = safeOpportunities.length > 0 ? safeOpportunities : opportunities;

    // Best opportunity (highest net profit that's actually profitable)
    const profitableOpps = opportunitiesForStats.filter(opp => opp.netProfitUsd > 0);
    const bestOpp = profitableOpps.length > 0 
      ? [...profitableOpps].sort((a, b) => b.netProfitUsd - a.netProfitUsd)[0]
      : null;

    // Calculate average spread per token
    const tokenStats = new Map<string, { spreads: number[]; chains: Set<string>; totalProfit: number }>();
    opportunitiesForStats.forEach(opp => {
      const symbol = opp.tokenSymbol;
      if (!tokenStats.has(symbol)) {
        tokenStats.set(symbol, { spreads: [], chains: new Set(), totalProfit: 0 });
      }
      const stats = tokenStats.get(symbol)!;
      if (opp.priceDiffPercent && opp.priceDiffPercent > 0) {
        stats.spreads.push(opp.priceDiffPercent);
      }
      stats.totalProfit += opp.netProfitUsd;
      stats.chains.add(opp.chainFrom);
      stats.chains.add(opp.chainTo);
    });

    // Find token with highest average spread (that has positive spreads)
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
  }, [opportunities]);

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

  const closeNotifications = () => setNotificationOpen(false);

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
    <DashboardLayout>
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab="Dashboard" 
      />

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
        onClick={() => {
          if (sidebarOpen) {
            setSidebarOpen(false);
          }
        }}
      >
        {/* Header */}
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationOpen={notificationOpen}
          onNotificationToggle={toggleNotifications}
          onNotificationClose={closeNotifications}
          profileDropdownOpen={profileDropdownOpen}
          onProfileDropdownToggle={toggleProfileDropdown}
          notifications={notifications as import('../components/dashboard/DashboardHeader').NotificationItem[]}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />

        {/* Main Dashboard Content */}
        <DashboardMainContent
          uniqueTokensInDb={uniqueTokensInDb}
          thresholds={thresholds}
          stats={stats}
          opportunities={opportunities}
          opportunitiesLoading={opportunitiesLoading}
          opportunitiesError={opportunitiesError}
          refreshOpportunities={refreshOpportunities}
          currencyPreference={currencyPreference}
          formatCurrency={formatCurrency}
          convertFromUsd={convertFromUsd}
        />

        {/* Notification Overlay */}
        {notificationOpen && (
          <div
            className="fixed inset-0 bg-black/40 lg:hidden z-40"
            onClick={closeNotifications}
          />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </DashboardLayout>
  );
};

const Dashboard = () => (
  <TokenProvider pollIntervalMs={3600000}>
    <DashboardContent />
  </TokenProvider>
);

export default Dashboard;
