import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Sidebar from "../components/dashboard/Sidebar";
import OpportunitiesHeader from "../components/opportunities/OpportunitiesHeader";
import OpportunitiesMainContent from "../components/opportunities/OpportunitiesMainContent";
import RangeSliderStyles from "../components/opportunities/RangeSliderStyles";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../hooks/usePreferences";
import { useCurrencyFormatter, type SupportedCurrency } from "../hooks/useCurrencyFormatter";
import useOpportunities from "../hooks/useOpportunities";
import { useNotifications } from "../hooks/useNotifications";
import type { OpportunityItem } from "../components/opportunities/types";

const capitalizeChain = (chain: string): string => {
  if (!chain) return 'Unknown';
  return chain
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { preferences } = usePreferences();
  const currencyPreference = (preferences?.currency ?? 'USD') as SupportedCurrency;
  const { formatCurrency } = useCurrencyFormatter(currencyPreference);
  const thresholds = preferences?.alertThresholds;

  const pollInterval = 3600000;

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications(10, pollInterval);

  const opportunityQuery = useMemo(() => {
    if (!preferences || !thresholds) {
      return { status: 'active', sortBy: 'score', sortOrder: 'desc' as const, limit: 100 };
    }

    return {
      status: 'active',
      sortBy: 'score',
      sortOrder: 'desc' as const,
      limit: 100,
      minProfit: thresholds.minProfit,
      maxGasCost: thresholds.maxGasCost,
      minROI: thresholds.minROI,
      minScore: thresholds.minScore
    };
  }, [preferences, thresholds]);

  const { opportunities } = useOpportunities({ pollIntervalMs: pollInterval, query: opportunityQuery });

  const mappedOpportunities: OpportunityItem[] = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return [];

    return opportunities
      .filter(opp => {
        // Only filter out explicitly flagged opportunities and those with negative profit
        // Keep opportunities with 0 profit as they might still be informative
        if (opp.flagged === true) return false;
        // Allow small positive and zero profits (some might round to 0)
        if (opp.netProfitUsd < -0.01) return false;
        return true;
      })
      .map(opp => {
        const roi = opp.roi || 0;
        const color = roi >= 90 ? 'emerald' : roi >= 75 ? 'yellow' : 'orange';

        return {
          token: opp.tokenSymbol,
          from: capitalizeChain(opp.chainFrom),
          to: capitalizeChain(opp.chainTo),
          priceDiff: `+${opp.priceDiffPercent?.toFixed(1) || '0'}%`,
          estProfit: formatCurrency(opp.netProfitUsd, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          roi: `${roi.toFixed(0)}%`,
          color
        };
      });
  }, [opportunities, formatCurrency]);

  const tokenOptions = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return ['All Tokens'];
    }

    const uniqueTokens = new Set(opportunities.map(opp => opp.tokenSymbol));
    return ['All Tokens', ...Array.from(uniqueTokens).sort()];
  }, [opportunities]);

  const chainOptions = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return ['All Chain Pairs'];
    }

    const uniquePairs = new Set(
      opportunities.map(opp => `${capitalizeChain(opp.chainFrom)} → ${capitalizeChain(opp.chainTo)}`)
    );
    return ['All Chain Pairs', ...Array.from(uniquePairs).sort()];
  }, [opportunities]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      /* Error handled by auth context */
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
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab="Opportunities" 
      />

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
          notifications={notifications}
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
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />

        <OpportunitiesMainContent
          opportunities={mappedOpportunities}
          rawOpportunities={opportunities || []}
          tokenOptions={tokenOptions}
          chainOptions={chainOptions}
        />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <RangeSliderStyles />
    </DashboardLayout>
  );
};

export default OpportunitiesPage;