import React, { useState } from 'react';
import OpportunitiesHero from './OpportunitiesHero';
import OpportunitiesFilters from './OpportunitiesFilters';
import OpportunitiesTable from './OpportunitiesTable';
import OpportunitiesChart from './OpportunitiesChart';
import type { OpportunityItem } from './types';

interface OpportunitiesMainContentProps {
  opportunities: OpportunityItem[];
  tokenOptions: string[];
  chainOptions: string[];
}

const TABLE_VIEW_OPTIONS = ["By Profit", "By Token", "ROI"];

const OpportunitiesMainContent: React.FC<OpportunitiesMainContentProps> = ({
  opportunities,
  tokenOptions,
  chainOptions
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1h" | "24h" | "7d">("1h");
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0]);
  const [selectedChainPair, setSelectedChainPair] = useState(chainOptions[0]);
  const [minProfit, setMinProfit] = useState(1);
  const [activeView, setActiveView] = useState(TABLE_VIEW_OPTIONS[0]);

  const handleResetFilters = () => {
    setSelectedToken(tokenOptions[0]);
    setSelectedChainPair(chainOptions[0]);
    setMinProfit(1);
    setSelectedTimeframe("1h");
    setActiveView(TABLE_VIEW_OPTIONS[0]);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <OpportunitiesHero />

      <OpportunitiesFilters
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
        selectedChainPair={selectedChainPair}
        onChainPairChange={setSelectedChainPair}
        minProfit={minProfit}
        onMinProfitChange={setMinProfit}
        tokenOptions={tokenOptions}
        chainOptions={chainOptions}
        onReset={handleResetFilters}
      />

      <OpportunitiesTable
        opportunities={opportunities}
        activeView={activeView}
        onViewChange={setActiveView}
        viewOptions={TABLE_VIEW_OPTIONS}
      />

      <OpportunitiesChart
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={(timeframe) => setSelectedTimeframe(timeframe)}
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
      />
    </main>
  );
};

export default OpportunitiesMainContent;
