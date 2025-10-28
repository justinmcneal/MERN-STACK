import { useState } from "react";
import { Link } from "react-router-dom";
import LegalModal, { type LegalModalType } from "../ui/LegalModal/LegalModal";

const AboutFooter = () => {
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType | null>(null);

  const quickLinks = [
    { label: "FAQ", to: "/faq" },
    { label: "About Us", to: "/about" }
  ];

  const handleLegalClick = (type: LegalModalType) => {
    setActiveLegalModal(type);
  };

  return (
    <>
      <LegalModal
        isOpen={activeLegalModal !== null}
        type={activeLegalModal || "terms"}
        onClose={() => setActiveLegalModal(null)}
      />

      <footer className="relative z-10 border-t border-slate-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-11">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-2xl font-bold">
                <span className="text-cyan-400">Arbi</span>
                <span className="text-white">Trage</span>
                <span className="text-purple-400 ml-1">Pro</span>
              </div>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Professional-grade monitoring platform powered by AI and real-time multi-chain data insights.
            </p>
            <div className="mt-4">
              <h5 className="text-cyan-200 font-semibold mb-2">Talk to Our Team</h5>
              <p className="text-sm text-slate-400">
                Email <a href="mailto:support@arbitragepro.com" className="text-cyan-300 hover:text-cyan-200 transition-colors">support@arbitragepro.com</a> for direct assistance from an analyst.
              </p>
            </div>
          </div>
          <div>
            <h5 className="text-cyan-200 font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-slate-400">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-cyan-200 font-semibold mb-4">Legal</h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => handleLegalClick("terms")}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLegalClick("privacy")}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLegalClick("disclaimer")}
                  className="hover:text-white transition-colors text-left"
                >
                  Risk Disclaimer
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-cyan-200 font-semibold mb-4">Contact</h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="block text-slate-500 text-xs uppercase tracking-wide">Email</span>
                <a href="mailto:support@arbitragepro.com" className="hover:text-white transition-colors">
                  support@arbitragepro.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/50 mt-12 pt-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} ArbiTrage Pro. All rights reserved. Monitoring is for informational purposes only.</p>
        </div>
      </div>
    </footer>
    </>
  );
};

export default AboutFooter;
