import React, { useState } from 'react';
import StatCardsWrapper from './StatCards';
import PriceTableSection from './PriceTableSection';
import ArbitrageTable from './ArbitrageTable';
import ChartComponent from './ChartComponent';
import type { SupportedCurrency, CurrencyFormatterFn, UsdConverterFn } from '../../hooks/useCurrencyFormatter';
import type { OpportunityDto } from '../../services/OpportunityService';

interface DashboardMainContentProps {
  stats: {
    bestOpportunity: {
      tokenSymbol: string;
      priceDiffPercent: number | undefined;
      netProfitUsd: number;
      chainFrom: string;
      chainTo: string;
    } | null;
    topToken: {
      symbol: string;
      avgSpread: number;
      chains: string[];
    } | null;
  };
  opportunities: OpportunityDto[];
  opportunitiesLoading: boolean;
  opportunitiesError: string | null;
  refreshOpportunities: () => void;
  currencyPreference: SupportedCurrency;
  formatCurrency: CurrencyFormatterFn;
  convertFromUsd: UsdConverterFn;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({
  stats,
  opportunities,
  opportunitiesLoading,
  opportunitiesError,
  refreshOpportunities,
  currencyPreference,
  formatCurrency,
  convertFromUsd
}) => {
  // Price table filtering state
  const [priceFilter, setPriceFilter] = useState<'all' | 'byChain' | 'byToken'>('all');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('');

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      {/* Stat Cards */}
      <StatCardsWrapper 
        bestOpportunity={stats.bestOpportunity}
        topToken={stats.topToken}
        currency={currencyPreference}
        formatCurrency={formatCurrency}
      />

      {/* Price Table and Arbitrage Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <PriceTableSection
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          currencyPreference={currencyPreference}
          formatCurrency={formatCurrency}
          convertFromUsd={convertFromUsd}
        />

        <ArbitrageTable
          opportunities={opportunities}
          loading={opportunitiesLoading}
          error={opportunitiesError}
          onRefresh={refreshOpportunities}
          currency={currencyPreference}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Chart Component */}
      <ChartComponent 
        currency={currencyPreference}
        formatCurrency={formatCurrency}
      />
    </main>
  );
};

export default DashboardMainContent;
