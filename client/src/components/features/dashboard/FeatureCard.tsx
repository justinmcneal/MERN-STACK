import React from 'react';
import type { FeatureCard as FeatureCardType } from '../../../types/trading';
import Card from '../../../ui/Card/Card';

const FeatureCard: React.FC<FeatureCardType> = ({ title, description, icon }) => {
  return (
    <Card variant="gradient" padding="lg" className="group hover:-translate-y-2 transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-300 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-bold text-cyan-200 mb-2 sm:mb-3 group-hover:text-cyan-100 transition-colors">
            {title}
          </h4>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;
