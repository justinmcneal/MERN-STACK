export type NotificationItem = {
  type: "price" | "arbitrage";
  title: string;
  pair?: string;
  target?: string;
  current?: string;
  details?: string;
  profit?: string;
  gas?: string;
  score?: number;
  time: string;
};

export type OpportunityItem = {
  token: string;
  from: string;
  to: string;
  priceDiff: string;
  estProfit: string;
  roi: string;
  color: "emerald" | "yellow" | string;
};
