import type { FAQItemData } from "./constants";

interface FAQListProps {
  faqs: FAQItemData[];
  openItems: string[];
  onToggle: (question: string) => void;
}

const FAQList = ({ faqs, openItems, onToggle }: FAQListProps) => {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openItems.includes(faq.question);
        return (
          <div
            key={faq.question}
            className="bg-slate-700/30 border border-slate-600/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-500/50"
          >
            <button
              onClick={() => onToggle(faq.question)}
              className="w-full flex items-start justify-between p-5 text-left transition-all hover:bg-slate-700/20"
            >
              <div className="flex items-start gap-4 flex-1">
                <span className="text-slate-200 font-medium pr-4">{faq.question}</span>
              </div>
              {isOpen ? (
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {isOpen && (
              <div className="px-5 pb-5">
                <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FAQList;
