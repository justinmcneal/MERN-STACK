import { useCallback, useEffect, useRef, useState } from 'react';
import AlertService, { type AlertDto, type AlertQuery } from '../services/AlertService';

export interface UseAlertsOptions {
  pollIntervalMs?: number;
  query?: AlertQuery;
  enabled?: boolean;
}

export function useAlerts(options?: UseAlertsOptions) {
  const { pollIntervalMs, query, enabled = true } = options ?? {};
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!enabled) {
      setAlerts([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [alertList, unread] = await Promise.all([
        AlertService.listAlerts(query),
        AlertService.getUnreadCount()
      ]);
      setAlerts(alertList);
      setUnreadCount(unread);
    } catch (err: unknown) {
      let message = 'Failed to load alerts';
      if (err instanceof Error && err.message) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(query)]);

  const markAsRead = useCallback(async (alertIds: string[]) => {
    if (!enabled) {
      return;
    }
    console.log('🔄 useAlerts.markAsRead called with:', alertIds);
    try {
      await AlertService.markAsRead(alertIds);
      console.log('✅ AlertService.markAsRead successful');
      await fetchAlerts();
      console.log('✅ Alerts refetched after markAsRead');
    } catch (err) {
      console.error('❌ Failed to mark alerts as read:', err);
    }
  }, [enabled, fetchAlerts]);

  const markAllAsRead = useCallback(async () => {
    if (!enabled) {
      return;
    }
    console.log('🔄 useAlerts.markAllAsRead called');
    try {
      await AlertService.markAllAsRead();
      console.log('✅ AlertService.markAllAsRead successful');
      await fetchAlerts();
      console.log('✅ Alerts refetched after markAllAsRead');
    } catch (err) {
      console.error('❌ Failed to mark all alerts as read:', err);
    }
  }, [enabled, fetchAlerts]);

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!enabled) {
      return;
    }
    try {
      await AlertService.deleteAlert(alertId);
      await fetchAlerts();
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  }, [enabled, fetchAlerts]);

  const clearAllNotifications = useCallback(async () => {
    if (!enabled) {
      return;
    }
    console.log('🔄 useAlerts.clearAllNotifications called');
    try {
      await AlertService.clearAllNotifications();
      console.log('✅ AlertService.clearAllNotifications successful');
      await fetchAlerts();
      console.log('✅ Alerts refetched after clearAll');
    } catch (err) {
      console.error('❌ Failed to clear all notifications:', err);
    }
  }, [enabled, fetchAlerts]);

  const clearReadNotifications = useCallback(async () => {
    if (!enabled) {
      return;
    }
    console.log('🔄 useAlerts.clearReadNotifications called');
    try {
      await AlertService.clearReadNotifications();
      console.log('✅ AlertService.clearReadNotifications successful');
      await fetchAlerts();
      console.log('✅ Alerts refetched after clearRead');
    } catch (err) {
      console.error('❌ Failed to clear read notifications:', err);
    }
  }, [enabled, fetchAlerts]);

  useEffect(() => {
    if (!enabled) {
      setAlerts([]);
      setUnreadCount(0);
      setLoading(false);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    fetchAlerts();

    if (pollIntervalMs && pollIntervalMs > 0) {
      intervalRef.current = window.setInterval(() => {
        fetchAlerts();
      }, pollIntervalMs);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, fetchAlerts, pollIntervalMs]);

  return {
    alerts,
    unreadCount,
    loading,
    error,
    refresh: fetchAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    clearAllNotifications,
    clearReadNotifications
  };
}

export default useAlerts;
