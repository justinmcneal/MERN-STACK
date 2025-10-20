import { Bell } from "lucide-react";
import type { NotificationFilter } from "./constants";

interface NotificationsEmptyStateProps {
  activeFilter: NotificationFilter;
}

const NotificationsEmptyState = ({ activeFilter }: NotificationsEmptyStateProps) => {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
      <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 className="text-slate-400 text-lg font-medium mb-2">No notifications found</h3>
      <p className="text-slate-500">There are no {activeFilter.toLowerCase()} notifications at this time.</p>
    </div>
  );
};

export default NotificationsEmptyState;
