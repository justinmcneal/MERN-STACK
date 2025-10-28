interface NotificationsActionsProps {
  hasNotifications: boolean;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

const NotificationsActions = ({
  hasNotifications,
  onMarkAllRead,
  onClearAll,
}: NotificationsActionsProps) => {
  if (!hasNotifications) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={onMarkAllRead}
        className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all font-medium"
      >
        Mark All as Read
      </button>
      <button
        onClick={onClearAll}
        className="px-6 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-300 hover:bg-red-500/20 transition-all font-medium"
      >
        Clear All
      </button>
    </div>
  );
};

export default NotificationsActions;
