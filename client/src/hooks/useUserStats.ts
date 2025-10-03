import { useState, useEffect, useCallback } from 'react';
import { userService, type UserStats } from '../services/api/services/userService';

// Temporary StatData type definition
interface StatData {
  title: string;
  value: string;
  icon: string;
  color: 'cyan' | 'emerald' | 'purple' | 'orange';
}

interface UseUserStatsState {
  stats: UserStats | null;
  statsData: StatData[]; // Formatted for StatsGrid component
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserStats(): UseUserStatsState {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
      // Fallback to mock data
      const mockStats: UserStats = {
        totalOpportunities: 24,
        activeAlerts: 8,
        totalProfit: "$2,847",
        successRate: 94,
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert UserStats to StatData format for UI components
  const statsData: StatData[] = stats ? [
    {
      title: "Total Opportunities",
      value: stats.totalOpportunities.toString(),
      icon: "chart", // Using string instead of JSX
      color: "cyan" as const
    },
    {
      title: "Active Alerts",
      value: stats.activeAlerts.toString(),
      icon: "alert", // Using string instead of JSX
      color: "emerald" as const
    },
    {
      title: "Total Profit",
      value: stats.totalProfit,
      icon: "money", // Using string instead of JSX
      color: "purple" as const
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: "check", // Using string instead of JSX
      color: "orange" as const
    }
  ] : [];

  const refetch = useCallback(() => fetchStats(), [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    statsData,
    loading,
    error,
    refetch,
  };
}

export default useUserStats;
