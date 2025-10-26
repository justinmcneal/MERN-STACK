import { BarChart3, HelpCircle, Info, Phone, Settings, User, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FAQNavItem {
  name: string;
  icon: LucideIcon;
  path?: string;
}

export interface FAQNotification {
  type: "price" | "arbitrage";
  title: string;
  time: string;
  pair?: string;
  target?: string;
  current?: string;
  details?: string;
  profit?: string;
  gas?: string;
  score?: number;
}

export interface FAQCategory {
  id: string;
  name: string;
}

export interface FAQItemData {
  question: string;
  answer: string;
  category: string;
}

export const FAQ_NAVIGATION: FAQNavItem[] = [
  { name: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { name: "Opportunities", icon: Zap, path: "/opportunities" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Contact Support", icon: Phone, path: "/contact-support" },
  { name: "FAQ", icon: HelpCircle },
  { name: "About Us", icon: Info, path: "/about-us" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export const FAQ_NOTIFICATIONS: FAQNotification[] = [
  {
    type: "price",
    title: "Price Target Hit",
    pair: "ETH/USDT",
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
    pair: "ETH/USDT",
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

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: "all", name: "All Questions" },
  { id: "getting-started", name: "Getting Started" },
  { id: "account", name: "Account & Security" },
  { id: "technical", name: "Technical Support" },
];

export const FAQ_ITEMS: FAQItemData[] = [
  {
    question: "What is arbitrage?",
    answer:
      "Arbitrage in cryptocurrency refers to the monitoring of price discrepancies for the same token across different exchanges. It is used to identify market inefficiencies and highlight potential opportunities without engaging in direct trading.",
    category: "getting-started",
  },
  {
    question: "Which chains/tokens are supported",
    answer:
      "We currently support major blockchains including Ethereum, Binance Smart Chain (BSC), and Polygon. Popular tokens include BTC, ETH, USDT, BNB, and MATIC. We're constantly adding new chains and tokens based on user demand.",
    category: "getting-started",
  },
  {
    question: "Is trading required to use Arbitrage monitoring?",
    answer:
      "No. The monitoring tool strictly observes and reports price differences. It does not perform any buying, selling, or trading.",
    category: "getting-started",
  },
  {
    question: "How do I reset my password?",
    answer:
      "To reset your password, go to the login page and click 'Forgot Password'. Enter your email address and follow the instructions sent to your inbox. The reset link will be valid for 24 hours.",
    category: "account",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we use enterprise-grade security measures including end-to-end encryption, secure data centers, and regular security audits. Your personal information and trading data are protected with industry-standard security protocols.",
    category: "account",
  },
  {
    question: "What browsers are supported?",
    answer:
      "Arbitrage Pro works best with Chrome, Firefox, Safari, and Edge (latest versions). We recommend using Chrome for the optimal experience with all features fully supported.",
    category: "technical",
  },
  {
    question: "Why is the dashboard loading slowly?",
    answer:
      "Slow loading can be caused by network issues, browser cache, or high server load. Try refreshing the page, clearing your browser cache, or checking your internet connection. If issues persist, contact support.",
    category: "technical",
  },
  {
    question: "Can I customize which tokens to monitor?",
    answer:
      "Yes, you can customize your token monitoring preferences in the Profile settings. Select which tokens you want to track and set custom alerts for specific price movements or arbitrage opportunities.",
    category: "getting-started",
  },
  {
    question: "Can I receive alerts for significant price differences?",
    answer:
      "Yes. Users can set thresholds to receive notifications when a token's price difference exceeds a specified percentage across exchanges.",
    category: "technical",
  },
  {
    question: "Are gas fees considered in arbitrage monitoring reports?",
    answer:
      "Yes, gas fees are factored into all opportunity calculations. Our AI-powered scoring system analyzes liquidity depth, slippage tolerance, gas costs, and historical patterns to provide accurate profit estimates.",
    category: "technical",
  },
  {
    question: "Does the monitoring tool provide visual charts or reports?",
    answer:
      "Yes, Arbitrage Pro includes comprehensive visual analytics with real-time charts, historical trend analysis, P&L tracking, and customizable reporting for tax compliance and strategy optimization.",
    category: "getting-started",
  },
];
