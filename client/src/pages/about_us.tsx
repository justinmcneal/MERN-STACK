import { Brain, Zap, Link2, BarChart3 } from "lucide-react";

const AboutUsPage = () => {

  const teamMembers = [
    {
      initials: "JM",
      name: "Justin Mc Neal Caronangan",
      title: "Project Manager & Data Scientist /",
      subtitle: "ML Engineer",
      gradient: "from-cyan-400 to-blue-500",
      description: "Leads project strategy and oversees the development of AI-driven monitoring models and scalable infrastructure. Specializes in designing systems and predictive analytics for financial markets."
    },
    {
      initials: "JW",
      name: "John Wayne Enrique",
      title: "UI/UX & Frontend Developer",
      gradient: "from-cyan-400 to-purple-500",
      description: "Designs and develops the user interfaces and seamless experiences for monitoring platforms. Creates responsive, professional-grade dashboards that make complex data accessible and actionable."
    },
    {
      initials: "JP",
      name: "Jame Patrick Palayo",
      title: "Backend Developer",
      gradient: "from-cyan-400 to-blue-600",
      description: "Architects and implements robust backend systems, API integrations, and database solutions for professional monitoring platforms. Ensures reliable real-time data processing and secure high-load use cases."
    },
    {
      initials: "JP",
      name: "Jean Claude Ganay",
      title: "Quality Assurance Engineer",
      gradient: "from-blue-400 to-cyan-500",
      description: "Ensures platform reliability, security, and performance through comprehensive testing protocols. Maintains quality standards for monitoring systems and user interface functionality."
    },
    {
      initials: "EB",
      name: "Ericka Brudo",
      title: "Research Specialist",
      gradient: "from-cyan-400 to-teal-500",
      description: "Conducts in-depth research and analysis of blockchain ecosystems, market patterns, and monitoring needs. Develops insights that influence platform innovation and strategic direction."
    }
  ];

  const technologies = [
    {
      icon: <Brain className="w-8 h-8 text-cyan-400" />,
      title: "Large Language Models",
      description: "Supports AI-aided expansion for natural language processing of market sentiment, news analysis, and intelligent pattern recognition across multiple data sources."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Real-Time Data Processing",
      description: "High-frequency data ingestion and analysis from 50+ exchanges, delivering sub-second latency for time-critical insights."
    },
    {
      icon: <Link2 className="w-8 h-8 text-purple-400" />,
      title: "Cross-Chain Integration",
      description: "Native support for multiple blockchain networks including Ethereum, Binance Smart Chain, Polygon, and more. Comprehensive arbitrage coverage."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
      title: "Advanced Analytics",
      description: "Sophisticated risk assessment algorithms, portfolio optimization tools, and performance tracking with comprehensive reporting and visualization."
    }
  ];

  const handleBackHome = () => {
    window.history.pushState({}, "", "/landing_page");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="relative z-50 w-full px-6 lg:px-8 py-[27px] backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 pr-6">
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
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Back Button */}
          <button onClick={handleBackHome}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>


          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">About </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">ArbiTrade Pro</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Transforming cross-chain monitoring through AI-powered analytics and real-time data insights.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">
                <span className="text-white">Our </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Mission</span>
              </h2>
              
              <div className="space-y-4 text-slate-300">
                <p>
                  At <span className="text-cyan-400 font-semibold">ArbiTrage Pro</span>, we're shaping the future of cryptocurrency monitoring through our <span className="text-purple-400 font-semibold">Cross-Chain Intelligence platform</span>. Leveraging advanced AI and machine learning algorithms, we provide professionals with <span className="text-cyan-400 font-semibold">real-time, actionable insights across multiple blockchains</span>.
                </p>
                
                <p>
                  Our platform combines cutting-edge artificial intelligence, sophisticated data processing, and comprehensive analytics to deliver <span className="font-semibold text-slate-200">professional-grade monitoring tools</span> for accurate and informed decision-making.
                </p>
                
                <p>
                  We believe that <span className="font-semibold text-slate-200">intelligent monitoring and data-driven insights</span> should be accessible to all users from individuals to institutions empowering them to <span className="font-semibold text-slate-200">track, analyze, and respond to market data with confidence and precision</span>.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 mb-6">
                <Brain className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                LLM-Powered Intelligence
              </h3>
              <p className="text-slate-300 text-center">
                Advanced AI algorithms analyze market patterns and provide real-time, intelligent monitoring insights.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-white">Meet Our </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Expert Team</span>
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto">
                Our diverse team of technology experts, data scientists, and market analysts combines decades of experience in blockchain technology, artificial intelligence, and quantitative analysis to deliver a world-class monitoring platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
                  <div className="flex flex-col items-center mb-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <span className="text-white font-bold text-2xl">{member.initials}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 text-center">{member.name}</h3>
                    <p className="text-cyan-400 text-sm text-center mb-1">{member.title}</p>
                    {member.subtitle && (
                      <p className="text-cyan-400 text-sm text-center">{member.subtitle}</p>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm text-center leading-relaxed">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-white">Our Technology </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Stack</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technologies.map((tech, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                      {tech.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">{tech.title}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{tech.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
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
                <p>© {new Date().getFullYear()} ArbiTrage Pro. All rights reserved. Monitoring is for informational purposes only.</p>
            </div>
            </div>
        </footer>
        </main>
      </div>
    </div>
  );
};

export default AboutUsPage;