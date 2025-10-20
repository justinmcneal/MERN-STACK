import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsLayout from "../components/notifications/NotificationsLayout";
import NotificationsHeader from "../components/notifications/NotificationsHeader";
import NotificationsBackButton from "../components/notifications/NotificationsBackButton";
import NotificationsFilterTabs from "../components/notifications/NotificationsFilterTabs";
import NotificationsList from "../components/notifications/NotificationsList";
import NotificationsEmptyState from "../components/notifications/NotificationsEmptyState";
import NotificationsActions from "../components/notifications/NotificationsActions";
import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_ITEMS,
  type NotificationData,
  type NotificationFilter,
} from "../components/notifications/constants";

const AllNotificationsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const [notifications, setNotifications] = useState<NotificationData[]>(NOTIFICATION_ITEMS);

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

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

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

        {filteredNotifications.length > 0 ? (
          <NotificationsList notifications={filteredNotifications} />
        ) : (
          <NotificationsEmptyState activeFilter={activeFilter} />
        )}

        <NotificationsActions
          hasNotifications={filteredNotifications.length > 0}
          onMarkAllRead={handleMarkAllRead}
          onClearAll={handleClearAll}
        />
      </main>
    </NotificationsLayout>
  );
};

export default AllNotificationsPage;