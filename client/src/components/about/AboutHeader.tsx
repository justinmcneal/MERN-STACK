const AboutHeader = () => {
  return (
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
  );
};

export default AboutHeader;
