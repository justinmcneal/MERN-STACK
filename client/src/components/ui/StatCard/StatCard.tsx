import React from "react";

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

export default StatCard;
