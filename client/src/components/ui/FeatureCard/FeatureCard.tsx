import React, { type ReactNode } from "react";

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

export default FeatureCard;
