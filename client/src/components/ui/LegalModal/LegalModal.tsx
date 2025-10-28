import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type LegalModalType = 'terms' | 'privacy' | 'disclaimer';

interface LegalModalProps {
  isOpen: boolean;
  type: LegalModalType;
  onClose: () => void;
}

const legalContent = {
  terms: {
    title: 'Terms of Service',
    content: `
# Terms of Service

## Last Updated: October 2025

### 1. Agreement to Terms
By accessing and using the ArbiTrade Pro platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this Service.

### 2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on ArbiTrade Pro for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to decompile or reverse engineer any software on the Service
- Remove any copyright or other proprietary notations from the materials
- Transfer the materials to another person or "mirror" the materials on any other server
- Violate any applicable laws or regulations

### 3. Disclaimer of Warranties
The materials on ArbiTrade Pro are provided on an 'as is' basis. ArbiTrade Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

### 4. Limitations of Liability
In no event shall ArbiTrade Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ArbiTrade Pro.

### 5. Accuracy of Materials
The materials appearing on ArbiTrade Pro could include technical, typographical, or photographic errors. ArbiTrade Pro does not warrant that any of the materials on the Service are accurate, complete, or current. ArbiTrade Pro may make changes to the materials contained on the Service at any time without notice.

### 6. Links and Third-Party Content
ArbiTrade Pro has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ArbiTrade Pro of the site. Use of any such linked website is at the user's own risk.

### 7. Modifications to Terms
ArbiTrade Pro may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.

### 8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which ArbiTrade Pro operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
    `
  },
  privacy: {
    title: 'Privacy Policy',
    content: `
# Privacy Policy

## Last Updated: October 2025

### 1. Introduction
ArbiTrade Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

### 2. Information We Collect
We may collect information about you in a variety of ways. The information we may collect on the Site includes:

**Personal Data:**
- Name
- Email address
- Password (hashed and encrypted)
- Profile information
- Trading preferences and alerts

**Automatically Collected Data:**
- Browser type and version
- Device information
- IP address
- Pages visited and time spent
- Referral source
- Clickstream data

### 3. Use of Your Information
Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
- Create and manage your account
- Process your transactions
- Generate invoices
- Send promotional communications (with your consent)
- Respond to your inquiries
- Improve our Service
- Monitor and analyze trends and usage

### 4. Disclosure of Your Information
We may share your information in the following circumstances:
- With service providers who assist us in operating the website
- As required by law or legal process
- To protect our legal rights
- With your consent

### 5. Data Security
We use appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.

### 6. Cookies and Tracking
We use cookies and similar tracking technologies to track activity on our Site and hold certain information. You can instruct your browser to refuse all cookies or to alert you when cookies are being sent.

### 7. Third-Party Links
The Site may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.

### 8. Data Retention
We retain your personal data for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.

### 9. Your Rights
Depending on your location, you may have certain rights regarding your personal data, including the right to access, correct, delete, or port your data. Please contact us to exercise these rights.

### 10. Contact Us
If you have questions about this Privacy Policy, please contact us at privacy@arbitradepro.com.
    `
  },
  disclaimer: {
    title: 'Risk Disclaimer',
    content: `
# Risk Disclaimer

## Last Updated: October 2025

### 1. No Investment Advice
This platform is provided for informational purposes only and does not constitute financial, investment, tax, or legal advice. The content on ArbiTrade Pro is not a recommendation to buy, sell, or hold any particular security or cryptocurrency.

### 2. Risk of Loss
Cryptocurrency and arbitrage trading involves substantial risk of loss. Past performance is not indicative of future results. The possibility exists that you could lose part or all of your initial investment. Therefore, you should not invest money that you cannot afford to lose.

### 3. Market Volatility
Cryptocurrency markets are highly volatile. Prices can fluctuate dramatically over short periods. Arbitrage opportunities depend on price discrepancies that may disappear quickly or may not materialize.

### 4. Technical Risks
- Trading platforms may experience technical failures
- Network connectivity issues may prevent timely order execution
- System errors may result in unintended trades

### 5. Gas Fees and Costs
- Gas fees can be unpredictable and may consume a significant portion of potential profits
- Network congestion may increase transaction costs
- Slippage may occur during execution

### 6. Regulatory Risks
- Cryptocurrency regulations are evolving and may impact trading
- Your jurisdiction may impose restrictions on cryptocurrency trading
- Regulatory changes could render certain arbitrage strategies unfeasible

### 7. Counterparty Risk
- Exchanges and third-party services may be compromised
- Smart contract vulnerabilities could result in loss of funds
- Custody solutions may present security risks

### 8. No Guarantee of Accuracy
While we strive to provide accurate information, we make no guarantee regarding the accuracy, completeness, or timeliness of data. Market conditions change rapidly, and information may become outdated.

### 9. Use at Your Own Risk
Your use of the ArbiTrade Pro platform is at your sole risk. We make no warranties regarding the availability or reliability of the Service.

### 10. Limitation of Liability
ArbiTrade Pro and its creators, owners, and operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.

### 11. Professional Advice
Before making any investment decisions, consult with qualified financial, tax, and legal professionals who understand your individual circumstances.

### 12. Acknowledgment
By using ArbiTrade Pro, you acknowledge that you have read this disclaimer, understand the risks involved in cryptocurrency and arbitrage trading, and agree to use the platform at your own risk.
    `
  }
};

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = legalContent[type];

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-invert max-w-none text-sm">
            {content.content.split('\n').map((line, idx) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2">
                    {line.replace('# ', '')}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-lg font-semibold text-cyan-300 mt-3 mb-2">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base font-semibold text-slate-200 mt-2 mb-1">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={idx} className="text-slate-300 ml-4 mb-1">
                    {line.replace('- ', '')}
                  </li>
                );
              }
              if (line.trim() === '') {
                return <div key={idx} className="mb-2" />;
              }
              return (
                <p key={idx} className="text-slate-300 mb-2 leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-6 bg-slate-950/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LegalModal;
