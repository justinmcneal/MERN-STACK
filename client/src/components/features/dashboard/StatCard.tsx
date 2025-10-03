import React from 'react';
import type { StatCard as StatCardType } from '../../../types/trading';
import Card from '../../../ui/Card/Card';

const StatCard: React.FC<StatCardType> = ({ value, label, trend }) => {
  return (
    <Card variant="glass" padding="md" className="text-center">
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">
        {value}
      </div>
      <div className="text-slate-400 text-xs sm:text-sm mb-2">
        {label}
      </div>
      <div className="text-emerald-400 text-xs font-medium">
        {trend}
      </div>
    </Card>
  );
};

export default StatCard;
