import { Search } from "lucide-react";
import type { FAQCategory } from "./constants";

export interface FAQCategoryWithCount extends FAQCategory {
  count: number;
}

interface FAQSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: FAQCategoryWithCount[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const FAQSearchFilters = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategorySelect,
}: FAQSearchFiltersProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-200">FAQ (Frequently Asked Questions)</h1>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50"
              }`}
            >
              {category.name} ({category.count})
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSearchFilters;
