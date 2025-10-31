import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Bell } from "lucide-react";
import NotificationsLayout from "../components/notifications/NotificationsLayout";
import NotificationsHeader from "../components/notifications/NotificationsHeader";
import NotificationsBackButton from "../components/notifications/NotificationsBackButton";
import NotificationsFilterTabs from "../components/notifications/NotificationsFilterTabs";
import NotificationsList from "../components/notifications/NotificationsList";
import NotificationsEmptyState from "../components/notifications/NotificationsEmptyState";
import NotificationsActions from "../components/notifications/NotificationsActions";
import {
  NOTIFICATION_FILTERS,
  type NotificationData,
  type NotificationFilter,
} from "../components/notifications/constants";
import { useNotifications } from "../hooks/useNotifications";

const AllNotificationsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const {
    notifications: backendNotifications,
    loading,
    error,
    markAllAsRead,
    clearAllNotifications,
    refresh,
  } = useNotifications(25, 300000);

  const notifications: NotificationData[] = useMemo(() => {
    return backendNotifications.map((notification) => {
      const rawMessage = (notification as Record<string, unknown>).message;
      const message = typeof rawMessage === "string" ? rawMessage : undefined;
      const base = {
        id: String(notification.id),
        title: notification.title ?? "Notification",
        time: notification.time ?? "",
        unread: !notification.isRead,
      };

      if (notification.type === "price") {
        return {
          ...base,
          type: "price" as const,
          icon: Target,
          iconClassName: "text-cyan-400",
          pair: notification.pair,
          target: notification.target,
          current: notification.current,
        } satisfies NotificationData;
      }

      if (notification.type === "arbitrage") {
        return {
          ...base,
          type: "arbitrage" as const,
          icon: TrendingUp,
          iconClassName: "text-emerald-400",
          details: notification.details,
          description:
            message ??
            notification.details ??
            "High-value arbitrage signal detected.",
          stats: {
            estimatedProfit: notification.profit,
            gasCost: notification.gas,
            confidenceScore: notification.score ? `${notification.score}/100` : undefined,
          },
        } satisfies NotificationData;
      }

      return {
        ...base,
        type: "system" as const,
        icon: Bell,
        iconClassName: "text-purple-400",
        description: message ?? notification.details ?? "System notification",
      } satisfies NotificationData;
    });
  }, [backendNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeFilter === "All") {
        return true;
      }

      if (activeFilter === "Alerts") {
        return notification.type === "price" || notification.type === "arbitrage";
      }

      if (activeFilter === "Systems") {
        return notification.type === "system";
      }

      if (activeFilter === "Unread") {
        return notification.unread;
      }

      return true;
    });
  }, [activeFilter, notifications]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(async () => {
    await clearAllNotifications();
  }, [clearAllNotifications]);

  return (
    <NotificationsLayout>
      <NotificationsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationsBackButton onBack={() => navigate("/dashboard")} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-white">All </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Notifications
            </span>
          </h1>
          <p className="text-slate-400">Manage your alerts and system notifications</p>
        </div>

        <NotificationsFilterTabs
          filters={NOTIFICATION_FILTERS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                onClick={refresh}
                className="rounded-lg border border-red-500/60 px-3 py-1 text-xs font-medium uppercase tracking-wide"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-8 text-center text-slate-400">
            Loading notifications…
          </div>
        ) : filteredNotifications.length > 0 ? (
          <NotificationsList notifications={filteredNotifications} />
        ) : (
          <NotificationsEmptyState activeFilter={activeFilter} />
        )}

        <NotificationsActions
          hasNotifications={!loading && filteredNotifications.length > 0}
          onMarkAllRead={handleMarkAllRead}
          onClearAll={handleClearAll}
        />
      </main>
    </NotificationsLayout>
  );
};

export default AllNotificationsPage;