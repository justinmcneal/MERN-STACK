import FeatureCard from "../ui/FeatureCard/FeatureCard";

const FeaturesSection = () => {
  return (
    <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 mb-4 sm:mb-6">
          Real-Time Monitoring for Market Professionals
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto px-4">
          Cutting-edge monitoring tools and AI-driven insights designed for professionals who require accuracy and actionable data.
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
          RESTful APIs and WebSocket feeds for real-time monitoring, supporting up to 1000 requests/second for professional use.
        </FeatureCard>

        <FeatureCard
          title="Smart Alert System"
          icon={
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4.464 19.536l9.536-9.536m0 0L9.464 4.464M14 10l4.536 4.536" />
            </svg>
          }
        >
          Customizable notifications delivered through email alerts and in-app dashboards. Set complex conditions and receive instant updates for high-value opportunities.
        </FeatureCard>
      </div>
    </section>
  );
};

export default FeaturesSection;
