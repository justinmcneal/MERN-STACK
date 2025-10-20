import NotificationCard from "./NotificationCard";
import type { NotificationData } from "./constants";

interface NotificationsListProps {
  notifications: NotificationData[];
}

const NotificationsList = ({ notifications }: NotificationsListProps) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationsList;
