import type { NotificationItem } from "../opportunities/types";

export const ABOUT_INSIDE_NOTIFICATIONS: NotificationItem[] = [
  {
    type: "price",
    title: "Price Target Hit",
  pair: "ETH/XRP",
    target: "$0.45",
    current: "$0.4523",
    time: "now",
  },
  {
    type: "arbitrage",
    title: "New Arbitrage Alert",
    details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
    profit: "$567",
    gas: "$15",
    score: 91,
    time: "now",
  },
  {
    type: "price",
    title: "Price Target Hit",
  pair: "ETH/XRP",
    target: "$0.45",
    current: "$0.4523",
    time: "36m ago",
  },
  {
    type: "arbitrage",
    title: "New Arbitrage Alert",
    details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
    profit: "$567",
    gas: "$15",
    score: 91,
    time: "1h ago",
  },
];
