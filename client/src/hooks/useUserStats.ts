import { useState, useEffect, useCallback } from 'react';
import { userService, type UserStats, type StatData } from '../services/api/services/userService';
import { mockData } from '../utils/mockData';

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
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "cyan" as const
    },
    {
      title: "Active Alerts",
      value: stats.activeAlerts.toString(),
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 5.5L9 10l-4.5 4.5L0 10l4.5-4.5z" />
        </svg>
      ),
      color: "emerald" as const
    },
    {
      title: "Total Profit",
      value: stats.totalProfit,
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: "purple" as const
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
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
