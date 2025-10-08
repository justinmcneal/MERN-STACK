import React from "react";
import TradingChart from "../features/trading/TradingChart";

const DashboardSection = () => {
  return (
    <section id="dashboard" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 mb-6">
          Professional Monitoring Interface
        </h3>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          A comprehensive monitoring dashboard designed for professionals seeking real-time insights and actionable data.
        </p>
      </div>

      <div className="relative">
        <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 backdrop-blur border border-slate-700/50 rounded-3xl p-6 lg:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <TradingChart compact={true} />
            </div>
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-4 lg:p-5 border border-slate-700/50">
                <h4 className="text-cyan-200 font-semibold mb-3 text-sm lg:text-base">Active Opportunities</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium text-sm">ETH/USDC</div>
                      <div className="text-xs text-slate-400">Uniswap → Sushiswap</div>
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">+4.2%</div>
                  </div>
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium text-sm">MATIC/WETH</div>
                      <div className="text-xs text-slate-400">Polygon → Ethereum</div>
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">+6.8%</div>
                  </div>
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium text-sm">BNB/BUSD</div>
                      <div className="text-xs text-slate-400">BSC → Arbitrum</div>
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">+3.7%</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 lg:p-5 border border-slate-700/50">
                <h4 className="text-cyan-200 font-semibold mb-3 text-sm lg:text-base">Portfolio Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Total Value</span>
                    <span className="text-white font-semibold text-sm">$127,430.82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">24h P&L</span>
                    <span className="text-emerald-400 font-semibold text-sm">+$3,247.19</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Success Rate</span>
                    <span className="text-emerald-400 font-semibold text-sm">87.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
