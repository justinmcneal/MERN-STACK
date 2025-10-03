import React from 'react';

export interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: 'cyan' | 'emerald' | 'purple' | 'orange';
}

interface StatsGridProps {
  stats: StatData[];
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  className = ""
}) => {
  const getIconBgColor = (color?: string) => {
    switch (color) {
      case 'cyan': return 'bg-cyan-500/20';
      case 'emerald': return 'bg-emerald-500/20';
      case 'purple': return 'bg-purple-500/20';
      case 'orange': return 'bg-orange-500/20';
      default: return 'bg-slate-500/20';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${getIconBgColor(stat.color)} rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
