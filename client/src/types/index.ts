// Export all types from common types file
export * from './common';

// Export existing trading types
export * from './trading';

// Trading-specific types can extend from trading types
export interface TradingOpportunityExtended {
  arbitrageScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
  gasEfficiency: number;
  volumeImpact: 'low' | 'medium' | 'high';
}

// Enhanced user types
export interface UserProfileExtended {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    expiresAt?: Date;
    features: string[];
  };
  portfolio: {
    totalValue: number;
    totalInvested: number;
    totalReturns: number;
    successRate: number;
    activePositions: number;
  };
  preferences: Record<string, any>;
  lastLogin?: string;
}

// Enhanced notification types
export interface NotificationExtended {
  id: string;
  type: 'price' | 'arbitrage' | 'system' | 'warning' | 'success';
  title: string;
  message: string;
  unread: boolean;
  timestamp: Date | string;
  metadata?: {
    token?: string;
    amount?: number;
    url?: string;
    action?: () => void;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}
