const AboutMission = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-white">Our </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Mission
          </span>
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>
            At <span className="text-cyan-400 font-semibold">ArbiTrage Pro</span>, we're shaping the future of cryptocurrency
            monitoring through our <span className="text-purple-400 font-semibold">Cross-Chain Intelligence platform</span>.
            Leveraging advanced AI and machine learning algorithms, we provide professionals with
            <span className="text-cyan-400 font-semibold"> real-time, actionable insights across multiple blockchains</span>.
          </p>
          <p>
            Our platform combines cutting-edge artificial intelligence, sophisticated data processing, and
            comprehensive analytics to deliver <span className="font-semibold text-slate-200">professional-grade monitoring tools</span>
            for accurate and informed decision-making.
          </p>
          <p>
            We believe that <span className="font-semibold text-slate-200">intelligent monitoring and data-driven insights</span>
            should be accessible to all users from individuals to institutions empowering them to
            <span className="font-semibold text-slate-200"> track, analyze, and respond to market data with confidence and precision</span>.
          </p>
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 mb-6">
          <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
          LLM-Powered Intelligence
        </h3>
        <p className="text-slate-300 text-center">
          Advanced AI algorithms analyze market patterns and provide real-time, intelligent monitoring insights.
        </p>
      </div>
    </div>
  );
};

export default AboutMission;
