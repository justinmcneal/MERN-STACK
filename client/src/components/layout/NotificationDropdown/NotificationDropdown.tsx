import React from 'react';
import { Bell, X, Target, TrendingUp } from 'lucide-react';

export interface Notification {
  id?: number;
  type: 'price' | 'arbitrage' | 'system' | 'alert';
  title: string;
  details?: string;
  description?: string;
  pair?: string;
  target?: string;
  current?: string;
  profit?: string;
  gas?: string;
  score?: number;
  stats?: {
    estimatedProfit?: string;
    gasCost?: string;
    confidenceScore?: string;
    executionTime?: string;
  };
  time: string;
  unread?: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllRead
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <Target className="w-4 h-4 text-cyan-400" />;
      case 'arbitrage':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'price':
        return 'border-l-cyan-400';
      case 'arbitrage':
        return 'border-l-emerald-400';
      default:
        return 'border-l-slate-400';
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-300" />
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-cyan-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  onClick={() => onNotificationClick?.(notification)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-800/50
                    border-l-4 ${getNotificationColor(notification.type)}
                    ${notification.unread ? 'bg-slate-800/30' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      {notification.details && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {notification.details}
                        </p>
                      )}
                      
                      {notification.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                      )}

                      {/* Stats for arbitrage notifications */}
                      {notification.type === 'arbitrage' && notification.stats && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Profit:</span>
                            <span className="text-emerald-400 font-medium">
                              {notification.stats.estimatedProfit}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Gas:</span>
                            <span className="text-slate-300">
                              {notification.stats.gasCost}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Score:</span>
                            <span className="text-cyan-400 font-medium">
                              {notification.stats.confidenceScore}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Price info for price notifications */}
                      {notification.type === 'price' && notification.pair && (
                        <div className="mt-2 flex justify-between text-xs">
                          <span className="text-slate-400">{notification.pair}</span>
                          <span className="text-cyan-400">
                            {notification.current} / {notification.target}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {notification.time}
                        </span>
                        {notification.score && (
                          <span className="text-xs text-cyan-400 font-medium">
                            Score: {notification.score}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-700/50">
            <button
              onClick={() => {
                // Navigate to all notifications page
                onClose();
              }}
              className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
