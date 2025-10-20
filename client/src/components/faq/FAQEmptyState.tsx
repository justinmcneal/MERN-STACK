interface FAQEmptyStateProps {
  searchQuery: string;
  activeCategoryName: string;
  onClearFilters: () => void;
}

const FAQEmptyState = ({ searchQuery, activeCategoryName, onClearFilters }: FAQEmptyStateProps) => {
  const message = searchQuery
    ? `No results found for "${searchQuery}"`
    : `No FAQs found in the "${activeCategoryName}" category`;

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">No FAQs Found</h3>
      <p className="text-slate-400 mb-4">{message}</p>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-lg text-sm font-medium transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FAQEmptyState;
