import React from "react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-slate-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
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
          </div>

          <div>
            <h5 className="text-cyan-200 font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-cyan-200 font-semibold mb-4">Legal</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Disclaimer</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-cyan-200 font-semibold mb-4">Contact</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/50 mt-12 pt-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} ArbiTrage Pro. All rights reserved.  Monitoring is for informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
