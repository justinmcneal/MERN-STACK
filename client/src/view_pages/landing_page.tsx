import React, { useState, useEffect,  } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

// Enhanced ArbiTrader Pro with professional design and animations
interface FeatureCardProps {
    title: string;
    children: ReactNode;
    icon: ReactNode;
  }
  const FeatureCard: React.FC<FeatureCardProps> = ({ title, children, icon }) => (
    <div className="group bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-400/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-2">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-300 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-bold text-cyan-200 mb-2 sm:mb-3 group-hover:text-cyan-100 transition-colors">{title}</h4>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
  
  // Define props for StatCard
  interface StatCardProps {
    value: string | number;
    label: string;
    trend: string;
  }
  
  const StatCard: React.FC<StatCardProps> = ({ value, label, trend }) => (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur border border-slate-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">{value}</div>
      <div className="text-slate-400 text-xs sm:text-sm mb-2">{label}</div>
      <div className="text-emerald-400 text-xs font-medium">{trend}</div>
    </div>
  );
const TradingChart = () => {
  const [activePoint, setActivePoint] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePoint(prev => (prev + 1) % 8);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-purple-500/5"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div>
            <h3 className="text-cyan-200 font-semibold text-sm sm:text-base">ETH/USDC Arbitrage</h3>
            <p className="text-emerald-400 text-xs sm:text-sm">+12.4% ROI detected</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">$2,847.32</div>
            <div className="text-emerald-400 text-xs sm:text-sm">+$127.45 (4.7%)</div>
          </div>
        </div>

        <div className="relative h-32 sm:h-36 lg:h-40">
          <svg className="w-full h-full" viewBox="0 0 400 160">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
              </linearGradient>
            </defs>
            
            <path
              d="M 0 120 Q 50 100 100 90 T 200 70 T 300 50 T 400 40"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 0 120 Q 50 100 100 90 T 200 70 T 300 50 T 400 40 L 400 160 L 0 160 Z"
              fill="url(#chartGradient)"
            />
            
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle
                key={i}
                cx={i * 57}
                cy={120 - i * 10}
                r={activePoint === i ? "6" : "4"}
                fill={activePoint === i ? "#22d3ee" : "#64748b"}
                className="transition-all duration-300"
              />
            ))}
            
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Ethereum</span>
          <span>Polygon</span>
          <span>BSC</span>
          <span>Arbitrum</span>
        </div>
      </div>
    </div>
  );
};

export default function ArbiTraderPro() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      ></div>

      {/* Header */}
      <header className="relative z-50 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-6 border-r border-slate-700">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-lg sm:text-2xl font-bold">
                <span className="text-cyan-400">Arbi</span>
                <span className="text-white">Trader</span>
                <span className="text-purple-400 ml-1">Pro</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex gap-14 text-slate-300">
              <a className="hover:text-cyan-400 transition-colors font-medium" href="#features">Features</a>
              <a className="hover:text-cyan-400 transition-colors font-medium" href="#dashboard">Dashboard</a>
              <a className="hover:text-cyan-400 transition-colors font-medium" href="#pricing">Pricing</a>
              <a className="hover:text-cyan-400 transition-colors font-medium" href="#about">About</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <button onClick={() => navigate("/logIn")} className="hidden sm:inline-flex px-4 sm:px-6 py-2 sm:py-2.5 border border-slate-600 hover:border-cyan-400 rounded-lg text-slate-300 hover:text-white transition-all duration-300 font-medium text-sm sm:text-base">
              Login
            </button>
            <button onClick={() => navigate("/signUp")} className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 font-semibold text-sm sm:text-base">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
                <button className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105">
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
          <StatCard value="12" label="Supported Chains" trend="Expanding weekly" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 mb-4 sm:mb-6">
            Professional Trading Arsenal
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto px-4">
            Cutting-edge tools and AI-driven insights designed for serious traders who demand precision and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <FeatureCard
            title="Real-Time Multi-Chain Monitoring"
            icon={
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          >
            Track token prices across 12+ blockchains with sub-second latency. Our enterprise-grade infrastructure processes over 10,000 price feeds simultaneously.
          </FeatureCard>

          <FeatureCard
            title="AI-Powered Opportunity Scoring"
            icon={
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          >
            Machine learning algorithms analyze liquidity depth, slippage tolerance, gas costs, and historical patterns to rank opportunities by profit potential.
          </FeatureCard>

          <FeatureCard
            title="Advanced Risk Management"
            icon={
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          >
            Comprehensive risk assessment including MEV protection, front-running detection, and automated position sizing based on your risk tolerance.
          </FeatureCard>

          <FeatureCard
            title="Professional Analytics Suite"
            icon={
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            Detailed performance tracking, P&L analysis, success rate metrics, and customizable reporting for tax compliance and strategy optimization.
          </FeatureCard>

          <FeatureCard
            title="Institutional API Access"
            icon={
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            }
          >
            RESTful APIs and WebSocket feeds for algorithmic trading, with rate limits up to 1000 requests/second for professional trading firms.
          </FeatureCard>

          <FeatureCard
            title="Smart Alert System"
            icon={
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4.464 19.536l9.536-9.536m0 0L9.464 4.464M14 10l4.536 4.536" />
              </svg>
            }
          >
            Customizable notifications via Telegram, Discord, email, and webhooks. Set complex conditions and receive instant alerts for high-value opportunities.
          </FeatureCard>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 mb-6">
            Professional Trading Interface
          </h3>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A comprehensive dashboard built for professional traders who need real-time insights and lightning-fast execution.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 backdrop-blur border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TradingChart />
              </div>
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="text-cyan-200 font-semibold mb-4">Active Opportunities</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">ETH/USDC</div>
                        <div className="text-sm text-slate-400">Uniswap → Sushiswap</div>
                      </div>
                      <div className="text-emerald-400 font-bold">+4.2%</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">MATIC/WETH</div>
                        <div className="text-sm text-slate-400">Polygon → Ethereum</div>
                      </div>
                      <div className="text-emerald-400 font-bold">+6.8%</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">BNB/BUSD</div>
                        <div className="text-sm text-slate-400">BSC → Arbitrum</div>
                      </div>
                      <div className="text-emerald-400 font-bold">+3.7%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="text-cyan-200 font-semibold mb-4">Portfolio Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Value</span>
                      <span className="text-white font-semibold">$127,430.82</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">24h P&L</span>
                      <span className="text-emerald-400 font-semibold">+$3,247.19</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Success Rate</span>
                      <span className="text-emerald-400 font-semibold">87.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                  <span className="text-white">Trader</span>
                  <span className="text-purple-400 ml-1">Pro</span>
                </div>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Professional-grade arbitrage trading platform powered by AI and real-time multi-chain data analysis.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-slate-300">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-slate-300">TG</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-slate-300">DC</span>
                </a>
              </div>
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
            <p>© {new Date().getFullYear()} ArbiTrader Pro. All rights reserved. Trading involves substantial risk of loss.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}