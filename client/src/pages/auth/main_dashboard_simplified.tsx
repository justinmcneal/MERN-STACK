import React, { useState } from "react";
import { Layout, type Notification } from "../../components/layout";
import { TradingChart, TokenTrendsChart } from "../../components/features/charts";
import { PriceDataTable, ArbitrageTable, type PriceData, type ArbitrageData } from "../../components/features/tables";
import { StatsGrid, type StatData } from "../../components/features/dashboard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [selectedToken, setSelectedToken] = useState("Select token");

  // Mock notifications data
  const notifications: Notification[] = [
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

  // Mock user data
  const user = {
    name: "John Wayne",
    email: "johnwayne@gmail.com",
  };

  // Mock stats data
  const statsData: StatData[] = [
    {
      title: "Total Opportunities",
      value: "24",
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "cyan"
    },
    {
      title: "Active Alerts",
      value: "8",
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 5.5L9 10l-4.5 4.5L0 10l4.5-4.5z" />
        </svg>
      ),
      color: "emerald"
    },
    {
      title: "Total Profit",
      value: "$2,847",
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: "purple"
    },
    {
      title: "Success Rate",
      value: "94%",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "orange"
    }
  ];

  // Mock data
  const priceData: PriceData[] = [
    { token: "ETH", chain: "Ethereum", currentPrice: "$57,842.50", lastUpdated: "2s ago" },
    { token: "ETH", chain: "BSC", currentPrice: "$3,247.85", lastUpdated: "1s ago" },
    { token: "ETH", chain: "Polygon", currentPrice: "$6,098", lastUpdated: "3s ago" },
    { token: "USDT", chain: "Ethereum", currentPrice: "$149.75", lastUpdated: "2s ago" },
    { token: "USDT", chain: "BSC", currentPrice: "$6,409", lastUpdated: "5s ago" },
    { token: "USDC", chain: "ETH", currentPrice: "$14.85", lastUpdated: "1s ago" },
  ];

  const arbitrageOpportunities: ArbitrageData[] = [
    { token: "ETH", from: "Ethereum", to: "Polygon", priceDiff: "+6.5%", gasFee: "$5", estProfit: "$45", score: 95 },
    { token: "ETH", from: "BSC", to: "Ethereum", priceDiff: "+5.3%", gasFee: "$3", estProfit: "$30", score: 92 },
    { token: "USDT", from: "BSC", to: "Polygon", priceDiff: "+3.1%", gasFee: "$2", estProfit: "$10", score: 87 },
    { token: "USDC", from: "Ethereum", to: "BSC", priceDiff: "+5.2%", gasFee: "$1", estProfit: "$15", score: 84 },
    { token: "BNB", from: "BSC", to: "Ethereum", priceDiff: "+3.8%", gasFee: "$4", estProfit: "$45", score: 78 },
    { token: "MATIC", from: "Polygon", to: "Ethereum", priceDiff: "+3.3%", gasFee: "$15", estProfit: "$12", score: 75 },
  ];

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
  };

  const handleMarkAllRead = () => {
    console.log('Mark all notifications as read');
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
  };

  return (
    <Layout
      title="Dashboard"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      notifications={notifications}
      user={user}
      onNotificationClick={handleNotificationClick}
      onMarkAllRead={handleMarkAllRead}
      onLogout={handleLogout}
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <StatsGrid stats={statsData} />

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TradingChart 
            title="ETH/USDC Arbitrage"
            subtitle="+12.4% ROI detected"
            value="$2,847.32"
            change="+$127.45 (4.7%)"
            height="h-64"
          />
          <TokenTrendsChart
            title="Token Trends"
            selectedTimeframe={selectedTimeframe}
            selectedToken={selectedToken}
            onTimeframeChange={handleTimeframeChange}
            onTokenChange={handleTokenChange}
          />
        </div>

        {/* Data Tables */}
        <PriceDataTable data={priceData} />
        <ArbitrageTable data={arbitrageOpportunities} />
      </div>
    </Layout>
  );
};

export default Dashboard;
