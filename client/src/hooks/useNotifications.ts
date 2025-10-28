import { useMemo } from 'react';
import useAlerts from './useAlerts';
import { usePreferences } from './usePreferences';
import type { NotificationItem } from '../components/opportunities/types';
import type { NotificationItem as DashboardNotificationItem } from '../components/dashboard/DashboardHeader';

const capitalizeChain = (chain: string): string => {
  if (!chain) return 'Unknown';
  return chain
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

interface UseNotificationsOptions {
  enabled?: boolean;
}

export const useNotifications = (limit: number = 10, pollIntervalMs: number = 3600000, options?: UseNotificationsOptions) => {
  const enabled = options?.enabled ?? true;
  const { preferences } = usePreferences({ enabled });
  const alertQuery = useMemo(() => ({ limit }), [limit]);
  const { alerts, loading, error, refresh, markAsRead, markAllAsRead, unreadCount, clearAllNotifications, clearReadNotifications } = useAlerts({ pollIntervalMs, query: alertQuery, enabled });

  const notifications: (NotificationItem & { id: string, isRead: boolean })[] | (DashboardNotificationItem & { id: string, isRead: boolean })[] = useMemo(() => {
    if (!enabled || !alerts || !preferences?.notificationSettings?.dashboard) return [];

    return alerts.map(alert => {
      if (alert.type === 'opportunity') {
        const tokenSymbol = alert.metadata?.tokenSymbol || 'Unknown';
        const chainFrom = capitalizeChain(alert.metadata?.chainFrom || '');
        const chainTo = capitalizeChain(alert.metadata?.chainTo || '');
        const profit = alert.metadata?.profit || 0;
        const roi = alert.metadata?.roi || 0;

        return {
          id: alert.id,
          isRead: alert.isRead,
          type: 'arbitrage' as const,
          title: alert.title || 'New Arbitrage Alert',
          details: alert.message || `${tokenSymbol} on ${chainFrom} → ${chainTo}`,
          profit: alert.profit || `$${profit.toFixed(0)}`,
          gas: alert.gas || '$0',
          score: alert.score || Math.round(roi),
          time: alert.time
        };
      }

      return {
        id: alert.id,
        isRead: alert.isRead,
        type: 'price' as const,
        title: alert.title || 'Price Alert',
        pair: alert.pair || alert.metadata?.tokenSymbol || 'Unknown',
        target: alert.target || '$0',
        current: alert.current || '$0',
        time: alert.time
      };
    });
  }, [alerts, enabled, preferences]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    clearReadNotifications
  };
};
