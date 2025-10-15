import React from "react";
import { TrendingUp } from "lucide-react";

interface MonitoringSettingsProps {
  minProfitThreshold: number;
  maxGasFee: number;
  onMinProfitThresholdChange: (value: number) => void;
  onMaxGasFeeChange: (value: number) => void;
  errors?: {
    minProfitThreshold?: string;
    maxGasFee?: string;
  };
}

const MonitoringSettings: React.FC<MonitoringSettingsProps> = ({
  minProfitThreshold,
  maxGasFee,
  onMinProfitThresholdChange,
  onMaxGasFeeChange,
  errors = {}
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-200">Monitoring Settings</h2>
          <p className="text-sm text-slate-400">Configure monitoring parameters and performance thresholds.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Minimum Profit Threshold */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-200 font-medium mb-1">Minimum Profit Threshold</h3>
              <p className="text-sm text-slate-400">Only show opportunities above this profit percentage</p>
              {errors.minProfitThreshold && <p className="text-xs text-red-400 mt-1">{errors.minProfitThreshold}</p>}
            </div>
            <div className="text-cyan-400 font-bold text-lg">{minProfitThreshold}%</div>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={minProfitThreshold}
              onChange={(e) => onMinProfitThresholdChange(parseFloat(e.target.value))}
              className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer profit-slider ${
                errors.minProfitThreshold ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0%</span>
              <span>2.5%</span>
              <span>5%</span>
              <span>7.5%</span>
              <span>10%</span>
            </div>
          </div>
        </div>

        {/* Maximum Gas Fee Tolerance */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-slate-200 font-medium mb-1">Maximum Gas Fee Tolerance</h3>
              <p className="text-sm text-slate-400">Skip opportunities where gas fees exceed this amount</p>
              {errors.maxGasFee && <p className="text-xs text-red-400 mt-1">{errors.maxGasFee}</p>}
            </div>
            <input
              type="number"
              value={maxGasFee}
              onChange={(e) => onMaxGasFeeChange(parseFloat(e.target.value))}
              className={`w-full sm:w-32 px-4 py-2.5 bg-slate-700/50 border rounded-xl text-slate-200 text-center focus:outline-none focus:ring-2 transition-all ${
                errors.maxGasFee 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-slate-600/50 focus:ring-cyan-400/50'
              }`}
            />
          </div>
        </div>
      </div>
      
      {/* Custom CSS for profit slider */}
      <style>{`
        .profit-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
        }
        .profit-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);
        }
        .profit-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, 
            #1e293b 0%, 
            #ec4899 ${(minProfitThreshold / 10) * 100}%, 
            #334155 ${(minProfitThreshold / 10) * 100}%, 
            #334155 100%
          );
        }
      `}</style>
    </div>
  );
};

export default MonitoringSettings;
