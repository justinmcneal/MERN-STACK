import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import LegalModal, { type LegalModalType } from '../LegalModal/LegalModal';

interface TermsAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  isLoading?: boolean;
}

const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  isLoading = false,
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAgree = () => {
    if (agreedToTerms) {
      onAgree();
      setAgreedToTerms(false);
      setHasReadTerms(false);
      setHasReadPrivacy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <LegalModal
        isOpen={activeLegalModal === 'terms'}
        type="terms"
        onClose={() => {
          setActiveLegalModal(null);
          setHasReadTerms(true);
        }}
      />
      <LegalModal
        isOpen={activeLegalModal === 'privacy'}
        type="privacy"
        onClose={() => {
          setActiveLegalModal(null);
          setHasReadPrivacy(true);
        }}
      />

      {createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
              <p className="text-sm text-slate-400 mt-1">
                Please review and agree to our policies before continuing
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Terms Section */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={hasReadTerms}
                    onChange={(e) => setHasReadTerms(e.target.checked)}
                    className="w-5 h-5 bg-slate-700 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50 text-cyan-500 mt-1 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="cursor-pointer text-sm">
                    <span className="text-slate-300">I have read and understand the </span>
                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('terms')}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                    >
                      Terms of Service
                    </button>
                  </label>
                </div>
              </div>

              {/* Privacy Section */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy-check"
                    checked={hasReadPrivacy}
                    onChange={(e) => setHasReadPrivacy(e.target.checked)}
                    className="w-5 h-5 bg-slate-700 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50 text-cyan-500 mt-1 cursor-pointer"
                  />
                  <label htmlFor="privacy-check" className="cursor-pointer text-sm">
                    <span className="text-slate-300">I have read and understand the </span>
                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('privacy')}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>

              {/* Agreement Section */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agree-check"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={!hasReadTerms || !hasReadPrivacy}
                    className="w-5 h-5 bg-slate-700 border border-slate-600 rounded focus:ring-2 focus:ring-emerald-400/50 text-emerald-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="agree-check"
                    className={`cursor-pointer text-sm ${
                      !hasReadTerms || !hasReadPrivacy ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="text-slate-300 font-medium">
                      I agree to the Terms of Service and Privacy Policy
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/50 p-6 bg-slate-950/50 flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Decline
              </button>
              <button
                onClick={handleAgree}
                disabled={!agreedToTerms || isLoading}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'I Agree & Continue'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TermsAgreementModal;
