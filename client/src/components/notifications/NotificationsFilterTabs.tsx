import type { NotificationFilter } from "./constants";

interface NotificationsFilterTabsProps {
  filters: NotificationFilter[];
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
}

const NotificationsFilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
}: NotificationsFilterTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              isActive
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/50 text-slate-400 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600/50"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationsFilterTabs;
