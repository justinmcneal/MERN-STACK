interface FAQContactBannerProps {
  onContactSupport: () => void;
}

const FAQContactBanner = ({ onContactSupport }: FAQContactBannerProps) => {
  return (
    <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">Still have questions?</h3>
            <p className="text-slate-400 text-sm">
              Can't find the answer you're looking for? Our support team is here to help 24/7.
            </p>
          </div>
        </div>
        <button
          onClick={onContactSupport}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQContactBanner;
