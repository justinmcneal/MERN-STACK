import { ArrowLeft, Bell, TrendingUp, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  type: string;
  title: string;
  time: string;
  unread: boolean;
  icon?: React.ReactNode;
  pair?: string;
  target?: string;
  current?: string;
  details?: string;
  description?: string;
  stats?: {
    estimatedProfit?: string;
    gasCost?: string;
    confidenceScore?: string;
    executionTime?: string;
    profit?: string;
    gas?: string;
    score?: number;
  };
}

const AllNotificationsPage = () => {
    const navigate = useNavigate();
    const activeFilter = "All"; // Static

  const notifications = [
    {
      id: 1,
      type: "price",
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      title: "Price Target Hit",
      pair: "ETH/USDT",
      target: "$0.45",
      current: "$0.4523",
      time: "now",
      unread: true
    },
    {
      id: 2,
      type: "arbitrage",
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "High Profit Arbitrage Alert",
      details: "ETH on BSC → ETH on Polygon = +3.5% spread",
      description: "A high-value arbitrage opportunity has been detected with excellent profit potential.",
      stats: {
        estimatedProfit: "$1,267",
        gasCost: "$12",
        confidenceScore: "94/100",
        executionTime: "~45 seconds"
      },
      time: "now",
      unread: true
    },
    {
      id: 3,
      type: "price",
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      title: "Price Target Hit",
      pair: "BTC/USDT",
      target: "$42,500",
      current: "$42,567",
      time: "15m ago",
      unread: false
    },
    {
      id: 4,
      type: "arbitrage",
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "High Profit Arbitrage Alert",
      details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
      description: "A high-value arbitrage opportunity has been detected with excellent profit potential.",
      stats: {
        estimatedProfit: "$567",
        gasCost: "$15",
        confidenceScore: "91/100",
        executionTime: "~38 seconds"
      },
      time: "36m ago",
      unread: false
    },
    {
      id: 5,
      type: "system",
      icon: <Bell className="w-6 h-6 text-purple-400" />,
      title: "System Maintenance Scheduled",
      description: "Platform maintenance scheduled for tonight at 2:00 AM UTC. Expected duration: 30 minutes.",
      time: "1h ago",
      unread: false
    },
    {
      id: 6,
      type: "arbitrage",
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "High Profit Arbitrage Alert",
      details: "MATIC on Polygon → MATIC on Ethereum = +4.2% spread",
      description: "A high-value arbitrage opportunity has been detected with excellent profit potential.",
      stats: {
        estimatedProfit: "$892",
        gasCost: "$8",
        confidenceScore: "96/100",
        executionTime: "~52 seconds"
      },
      time: "2h ago",
      unread: false
    }
  ];


  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Alerts") return notif.type === "price" || notif.type === "arbitrage";
    if (activeFilter === "Systems") return notif.type === "system";
    if (activeFilter === "Unread") return notif.unread;
    return true;
  });

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <div className={`bg-slate-800/30 border rounded-2xl p-6 transition-all hover:bg-slate-800/40 ${
      notification.unread ? 'border-cyan-500/30' : 'border-slate-700/50'
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
          {notification.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-slate-200 font-semibold text-lg">{notification.title}</h3>
            <span className="text-xs text-cyan-400 whitespace-nowrap ml-4">{notification.time}</span>
          </div>

          {notification.type === "price" && (
            <div>
              <p className="text-slate-300 text-sm mb-1">
                {notification.pair} reached your target of {notification.target}
              </p>
              <p className="text-slate-400 text-xs">
                Alert set: {notification.target} • Current: {notification.current}
              </p>
            </div>
          )}

          {notification.type === "arbitrage" && (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[35px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div className="font-bold text-lg">
                  <span className="text-cyan-400">ArbiTrage</span>
                  <span className="text-purple-400 ml-1">Pro</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">All </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Notifications</span>
            </h1>
            <p className="text-slate-400">Manage your alerts and system notifications</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {["All", "Alerts", "Systems", "Unread"].map((filter) => (
              <button
                key={filter}
                onClick={() => {}}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-800/50 text-slate-400 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-slate-400 text-lg font-medium mb-2">No notifications found</h3>
                <p className="text-slate-500">There are no {activeFilter.toLowerCase()} notifications at this time.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {filteredNotifications.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all font-medium">
                Mark All as Read
              </button>
              <button className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all font-medium">
                Clear All Notifications
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllNotificationsPage;