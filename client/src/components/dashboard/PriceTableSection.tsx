import React from 'react';
import PriceTable from './PriceTable';
import type { SupportedCurrency, CurrencyFormatterFn, UsdConverterFn } from '../../hooks/useCurrencyFormatter';

interface PriceTableSectionProps {
  priceFilter: 'all' | 'byChain' | 'byToken';
  setPriceFilter: (filter: 'all' | 'byChain' | 'byToken') => void;
  selectedChain: string | null;
  setSelectedChain: (chain: string | null) => void;
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  currencyPreference: SupportedCurrency;
  formatCurrency: CurrencyFormatterFn;
  convertFromUsd: UsdConverterFn;
}

const PriceTableSection: React.FC<PriceTableSectionProps> = ({
  priceFilter,
  setPriceFilter,
  selectedChain,
  setSelectedChain,
  selectedToken,
  setSelectedToken,
  currencyPreference,
  formatCurrency,
  convertFromUsd
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          Price Table
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPriceFilter('all');
              setSelectedChain(null);
              setSelectedToken('');
            }}
            className={`px-3 py-1 text-xs rounded-lg ${priceFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50 transition-all`}
          >
            All Chains
          </button>
          <button
            onClick={() => {
              setPriceFilter('byChain');
              setSelectedToken('');
            }}
            className={`px-3 py-1 text-xs rounded-lg ${priceFilter === 'byChain' ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50 transition-all`}
          >
            By Chain
          </button>
          <button
            onClick={() => {
              setPriceFilter('byToken');
              setSelectedChain(null);
            }}
            className={`px-3 py-1 text-xs rounded-lg ${priceFilter === 'byToken' ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-slate-400'} hover:text-slate-300 border border-slate-600/50 transition-all`}
          >
            By Token
          </button>
        </div>
      </div>
      <PriceTable
        filterMode={priceFilter}
        selectedChain={selectedChain}
        onSelectChain={setSelectedChain}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
        currency={currencyPreference}
        formatCurrency={formatCurrency}
        convertFromUsd={convertFromUsd}
      />
    </div>
  );
};

export default PriceTableSection;
