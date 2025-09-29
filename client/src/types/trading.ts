export interface TradingOpportunity {
  id: string;
  tokenPair: string;
  sourceExchange: string;
  targetExchange: string;
  priceDifference: number;
  roi: number;
  volume: number;
  gasCost: number;
  netProfit: number;
  timestamp: string;
  status: 'active' | 'expired' | 'executed';
}

export interface TradingChart {
  id: string;
  symbol: string;
  data: ChartDataPoint[];
  timeframe: '1h' | '4h' | '1d' | '1w';
}

export interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

export interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  successRate: number;
  totalTrades: number;
  profitableTrades: number;
}

export interface StatCard {
  value: string | number;
  label: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}
