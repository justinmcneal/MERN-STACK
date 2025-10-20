import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TradingChart from "../features/trading/TradingChart";
import StatCard from "../ui/StatCard/StatCard";

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartMonitoring = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    navigate("/logIn");
  };

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-medium">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Live market scanning active</span>
              <span className="sm:hidden">Live scanning</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200">
                Discover Profitable
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                Cross-Chain Arbitrage
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Leverage AI-powered insights and real-time multi-chain data to identify and execute profitable arbitrage opportunities with institutional-grade precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleStartMonitoring}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">START MONITORING NOW</span>
                <span className="sm:hidden">START NOW</span>
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-white font-semibold transition-all duration-300 text-sm sm:text-base lg:text-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1.586a1 1 0 01-.293.707L12 14" />
                </svg>
                <span className="hidden sm:inline">Watch Demo</span>
                <span className="sm:hidden">Demo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
            <TradingChart />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 lg:mt-20">
        <StatCard value="$2.4M+" label="Total Volume Tracked" trend="+127% this month" />
        <StatCard value="156" label="Active Opportunities" trend="Real-time updates" />
        <StatCard value="18.4%" label="Avg ROI Potential" trend="+2.1% vs last week" />
        <StatCard value="3" label="Supported Chains" trend="Expanding" />
      </div>
    </section>
  );
};

export default HeroSection;
