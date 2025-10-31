import FeatureCard from "../ui/FeatureCard/FeatureCard";

const FeaturesSection = () => {
  return (
    <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 mb-4 sm:mb-6">
          Live Arbitrage Intelligence for Market Professionals
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto px-4">
          We ingest pricing for ETH, XRP, SOL, BNB, and MATIC across Ethereum, Polygon, and BSC, rank every spread with ML scoring, and surface the results through dashboards, alerts, and APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <FeatureCard
          title="Live Multi-Chain Coverage"
          icon={
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        >
          Continuous sync of CEX and DEX prices for supported tokens on Ethereum, Polygon, and BSC. DataService pipelines update chain-specific prices and maintain historical context for downstream analytics.
        </FeatureCard>

        <FeatureCard
          title="Machine-Learning Opportunity Ranking"
          icon={
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          The ML service scores each opportunity between 0 and 1, calculating ROI, trade size, gross and net profit after gas so you can prioritize the spreads that truly clear post-fee.
        </FeatureCard>

        <FeatureCard
          title="Built-In Risk Guardrails"
          icon={
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        >
          ArbitrageService filters out spreads with extreme CEX/DEX divergence, unrealistic gas ratios, or other anomaly flags, keeping the dashboard focused on reliable opportunities.
        </FeatureCard>

        <FeatureCard
          title="Historical Pricing & Trend Analysis"
          icon={
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        >
          TokenService.history powers multi-timeframe charts with cached minute, hourly, and weekly data so teams can track pricing trends, volatility, and spread movement over time.
        </FeatureCard>

        <FeatureCard
          title="Programmatic API & Streaming Updates"
          icon={
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          }
        >
          Use REST endpoints for opportunities, tokens, alerts, and health checks, or subscribe to the WebSocket service for push updates when new spreads, prices, or alerts land.
        </FeatureCard>

        <FeatureCard
          title="Actionable Alerts & Notifications"
          icon={
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4.464 19.536l9.536-9.536m0 0L9.464 4.464M14 10l4.536 4.536" />
            </svg>
          }
        >
          Manage alert workflows end-to-end with unread counts, tagging, bulk actions, and Socket.IO push notifications so desks never miss a profitable event.
        </FeatureCard>
      </div>
    </section>
  );
};

export default FeaturesSection;
