import { apiClient } from './api';

export interface AlertDto {
  id: string;
  type: 'opportunity' | 'price' | 'system' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  details?: string;
  profit?: string;
  gas?: string;
  score?: number;
  pair?: string;
  target?: string;
  current?: string;
  time: string;
  isRead: boolean;
  metadata?: {
    tokenSymbol?: string;
    chainFrom?: string;
    chainTo?: string;
    profit?: number;
    roi?: number;
  };
}

export interface AlertQuery {
  isRead?: boolean;
  alertType?: string;
  priority?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AlertApiResponse {
  success: boolean;
  count: number;
  total: number;
  data: Array<{
    _id: string;
    message: string;
    alertType: 'opportunity' | 'price' | 'system' | 'custom';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    createdAt: string;
    metadata?: {
      tokenSymbol?: string;
      chainFrom?: string;
      chainTo?: string;
      profit?: number;
      roi?: number;
    };
    opportunityId?: {
      _id: string;
      tokenId?: {
        symbol?: string;
      };
      chainFrom?: string;
      chainTo?: string;
      estimatedProfit?: number;
      score?: number;
    } | null;
  }>;
}

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const formatUsd = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const AlertService = {
  async listAlerts(query?: AlertQuery): Promise<AlertDto[]> {
    const response = await apiClient.get<AlertApiResponse>('/alerts', {
      params: {
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...query
      }
    });

    const items = response.data?.data ?? [];

    return items.map((item) => {
      const baseAlert: AlertDto = {
        id: item._id,
        type: item.alertType,
        priority: item.priority,
        title: '',
        message: item.message,
        time: formatTimeAgo(item.createdAt),
        isRead: item.isRead,
        metadata: item.metadata
      };

      // Format based on alert type
      if (item.alertType === 'opportunity' && item.opportunityId) {
        const opp = item.opportunityId;
        const tokenSymbol = item.metadata?.tokenSymbol || opp.tokenId?.symbol || 'Unknown';
        const chainFrom = item.metadata?.chainFrom || opp.chainFrom || '';
        const chainTo = item.metadata?.chainTo || opp.chainTo || '';
        const profit = item.metadata?.profit ?? opp.estimatedProfit ?? 0;
        const score = opp.score ?? 0;

        baseAlert.title = 'New Arbitrage Alert';
        baseAlert.details = `${tokenSymbol} on ${chainFrom} → ${tokenSymbol} on ${chainTo}`;
        baseAlert.profit = formatUsd(profit);
        baseAlert.gas = '$15'; // Placeholder - could be calculated
        baseAlert.score = Math.round(score * 100);
      } else if (item.alertType === 'price') {
        baseAlert.title = 'Price Target Hit';
        baseAlert.pair = item.metadata?.tokenSymbol 
          ? `${item.metadata.tokenSymbol}/USDT`
          : 'Unknown Pair';
        // Extract target/current from message if available
        // This is a placeholder - you might want to store these in metadata
        baseAlert.target = '$0.00';
        baseAlert.current = '$0.00';
      } else if (item.alertType === 'system') {
        baseAlert.title = 'System Notification';
      } else {
        baseAlert.title = 'Alert';
      }

      return baseAlert;
    });
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ success: boolean; unreadCount: number }>('/alerts/unread-count');
    return response.data?.unreadCount ?? 0;
  },

  async markAsRead(alertIds: string[]): Promise<void> {
    await apiClient.post('/alerts/mark-read', { alertIds });
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/alerts/mark-read', { markAll: true });
  },

  async deleteAlert(alertId: string): Promise<void> {
    await apiClient.delete(`/alerts/${alertId}`);
  }
};

export default AlertService;
