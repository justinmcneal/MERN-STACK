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
  score?: string;
}

export interface NotificationData {
  id: string;
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
