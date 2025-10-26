import { Bell, Target, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NotificationType = "price" | "arbitrage" | "system";
export type NotificationFilter = "All" | "Alerts" | "Systems" | "Unread";

export interface NotificationStats {
  estimatedProfit?: string;
  gasCost?: string;
  confidenceScore?: string;
  executionTime?: string;
  profit?: string;
  gas?: string;
  score?: number;
}

export interface NotificationData {
  id: number;
  type: NotificationType;
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  time: string;
  unread: boolean;
  pair?: string;
  target?: string;
  current?: string;
  details?: string;
  description?: string;
  stats?: NotificationStats;
}

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  "All",
  "Alerts",
  "Systems",
  "Unread",
];

export const NOTIFICATION_ITEMS: NotificationData[] = [
  {
    id: 1,
    type: "price",
    icon: Target,
  title: "Price Target Hit",
  iconClassName: "text-cyan-400",
  pair: "ETH/XRP",
    target: "$0.45",
    current: "$0.4523",
    time: "now",
    unread: true,
  },
  {
    id: 2,
    type: "arbitrage",
    icon: TrendingUp,
  title: "High Profit Arbitrage Alert",
  iconClassName: "text-emerald-400",
    details: "ETH on BSC → ETH on Polygon = +3.5% spread",
    description:
      "A high-value arbitrage opportunity has been detected with excellent profit potential.",
    stats: {
      estimatedProfit: "$1,267",
      gasCost: "$12",
      confidenceScore: "94/100",
      executionTime: "~45 seconds",
    },
    time: "now",
    unread: true,
  },
  {
    id: 3,
    type: "price",
    icon: Target,
  title: "Price Target Hit",
  iconClassName: "text-cyan-400",
  pair: "BTC/XRP",
    target: "$42,500",
    current: "$42,567",
    time: "15m ago",
    unread: false,
  },
  {
    id: 4,
    type: "arbitrage",
    icon: TrendingUp,
  title: "High Profit Arbitrage Alert",
  iconClassName: "text-emerald-400",
    details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
    description:
      "A high-value arbitrage opportunity has been detected with excellent profit potential.",
    stats: {
      estimatedProfit: "$567",
      gasCost: "$15",
      confidenceScore: "91/100",
      executionTime: "~38 seconds",
    },
    time: "36m ago",
    unread: false,
  },
  {
    id: 5,
    type: "system",
    icon: Bell,
  title: "System Maintenance Scheduled",
  iconClassName: "text-purple-400",
    description:
      "Platform maintenance scheduled for tonight at 2:00 AM UTC. Expected duration: 30 minutes.",
    time: "1h ago",
    unread: false,
  },
  {
    id: 6,
    type: "arbitrage",
    icon: TrendingUp,
  title: "High Profit Arbitrage Alert",
  iconClassName: "text-emerald-400",
    details: "MATIC on Polygon → MATIC on Ethereum = +4.2% spread",
    description:
      "A high-value arbitrage opportunity has been detected with excellent profit potential.",
    stats: {
      estimatedProfit: "$892",
      gasCost: "$8",
      confidenceScore: "96/100",
      executionTime: "~52 seconds",
    },
    time: "2h ago",
    unread: false,
  },
];
