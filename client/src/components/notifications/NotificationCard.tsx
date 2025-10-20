import type { NotificationData } from "./constants";

interface NotificationCardProps {
  notification: NotificationData;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const Icon = notification.icon;
  const isUnread = notification.unread;
  const iconClassName = notification.iconClassName ?? "text-slate-300";
  const isPriceAlert = notification.type === "price";
  const isArbitrageAlert = notification.type === "arbitrage";

  return (
    <div
      className={`bg-slate-800/30 border rounded-2xl p-6 transition-all hover:bg-slate-800/40 ${
        isUnread ? "border-cyan-500/30" : "border-slate-700/50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-6 h-6 ${iconClassName}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-slate-200 font-semibold text-lg">{notification.title}</h3>
            <span className="text-xs text-cyan-400 whitespace-nowrap ml-4">{notification.time}</span>
          </div>

          {isPriceAlert && (
            <div>
              <p className="text-slate-300 text-sm mb-1">
                {notification.pair} reached your target of {notification.target}
              </p>
              <p className="text-slate-400 text-xs">
                Alert set: {notification.target} • Current: {notification.current}
              </p>
            </div>
          )}

          {isArbitrageAlert && (
            <div>
              <p className="text-emerald-400 text-sm mb-2">{notification.details}</p>
              <p className="text-slate-300 text-sm mb-3">{notification.description}</p>
              <div className="text-xs text-slate-400">
                Estimated Profit: <span className="text-emerald-400">{notification.stats?.estimatedProfit}</span> •
                Gas Cost: <span className="text-slate-300"> {notification.stats?.gasCost}</span> •
                Confidence Score: <span className="text-cyan-400"> {notification.stats?.confidenceScore}</span> •
                Execution Time: <span className="text-slate-300"> {notification.stats?.executionTime}</span>
              </div>
            </div>
          )}

          {notification.type === "system" && (
            <p className="text-slate-300 text-sm">{notification.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
