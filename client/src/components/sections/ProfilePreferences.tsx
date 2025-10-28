// components/sections/ProfilePreferences.tsx
import { useState, useEffect } from "react";

interface ProfilePreferencesProps {
  dashboardPopup: boolean;
  emailNotifications: boolean;
  profitThreshold: number;
  minProfit: number;
  maxGasCost: number;
  minScore: number;
  onUpdate?: (data: { 
    dashboardPopup?: boolean;
    emailNotifications?: boolean;
    profitThreshold?: number;
    minProfit?: number;
    maxGasCost?: number;
    minScore?: number;
  }) => void;
  isUpdating?: boolean;
  className?: string;
}

const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  disabled 
}: { 
  enabled: boolean; 
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
      enabled ? 'bg-cyan-500' : 'bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const ProfilePreferences: React.FC<ProfilePreferencesProps> = ({
  dashboardPopup,
  emailNotifications,
  profitThreshold,
  minProfit,
  maxGasCost,
  minScore,
  onUpdate,
  isUpdating = false,
  className = ""
}) => {
  const [localDashboardPopup, setLocalDashboardPopup] = useState(dashboardPopup);
  const [localEmailNotifications, setLocalEmailNotifications] = useState(emailNotifications);
  const [localProfitThreshold, setLocalProfitThreshold] = useState(profitThreshold);
  const [localMinProfit, setLocalMinProfit] = useState(minProfit);
  const [localMaxGasCost, setLocalMaxGasCost] = useState(maxGasCost);
  const [localMinScore, setLocalMinScore] = useState(minScore);
  const [profitThresholdError, setProfitThresholdError] = useState<string>('');
  const [minProfitError, setMinProfitError] = useState<string>('');
  const [maxGasCostError, setMaxGasCostError] = useState<string>('');

  // Update local state when props change
  useEffect(() => {
    setLocalDashboardPopup(dashboardPopup);
    setLocalEmailNotifications(emailNotifications);
    setLocalProfitThreshold(profitThreshold);
    setLocalMinProfit(minProfit);
    setLocalMaxGasCost(maxGasCost);
    setLocalMinScore(minScore);
  }, [dashboardPopup, emailNotifications, profitThreshold, minProfit, maxGasCost, minScore]);

  const validateProfitThreshold = (value: number): boolean => {
    if (value < 0 || value > 50) {
      setProfitThresholdError('ROI threshold must be between 0 and 50%');
      return false;
    }
    setProfitThresholdError('');
    return true;
  };

  const validateMinProfit = (value: number): boolean => {
    if (value < 1 || value > 10000) {
      setMinProfitError('Minimum profit must be between $1 and $10,000');
      return false;
    }
    setMinProfitError('');
    return true;
  };

  const validateMaxGasCost = (value: number): boolean => {
    if (value < 1 || value > 500) {
      setMaxGasCostError('Maximum gas cost must be between $1 and $500');
      return false;
    }
    setMaxGasCostError('');
    return true;
  };

  const handleDashboardToggle = () => {
    const newValue = !localDashboardPopup;
    setLocalDashboardPopup(newValue);
    
    // Update pending changes immediately
    onUpdate?.({ dashboardPopup: newValue });
  };

  const handleEmailToggle = () => {
    const newValue = !localEmailNotifications;
    setLocalEmailNotifications(newValue);
    
    // Update pending changes immediately
    onUpdate?.({ emailNotifications: newValue });
  };

  const handleProfitThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalProfitThreshold(value);
    validateProfitThreshold(value);
    
    // Update pending changes immediately if valid
    if (validateProfitThreshold(value)) {
      onUpdate?.({ profitThreshold: value });
    }
  };

  const handleProfitThresholdBlur = () => {
    if (localProfitThreshold !== profitThreshold && validateProfitThreshold(localProfitThreshold)) {
      onUpdate?.({ profitThreshold: localProfitThreshold });
    }
  };

  const handleMinProfitChange = (value: number) => {
    setLocalMinProfit(value);
    if (validateMinProfit(value)) {
      onUpdate?.({ minProfit: value });
    }
  };

  const handleMaxGasCostChange = (value: number) => {
    setLocalMaxGasCost(value);
    if (validateMaxGasCost(value)) {
      onUpdate?.({ maxGasCost: value });
    }
  };

  const handleMinScoreChange = (value: number) => {
    setLocalMinScore(value);
    onUpdate?.({ minScore: value });
  };
  return (
    <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/30 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-200">Preferences</h2>
      </div>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm text-slate-400">Notification Preferences</label>
            <div className="group relative">
              <svg className="w-4 h-4 text-slate-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 z-10 shadow-xl">
                Choose how to receive alerts for opportunities that match your filters
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">Choose how to receive alerts for filtered opportunities</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Dashboard Popup</span>
              <ToggleSwitch 
                enabled={localDashboardPopup}
                onChange={handleDashboardToggle}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Email</span>
              <ToggleSwitch 
                enabled={localEmailNotifications}
                onChange={handleEmailToggle}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        {/* Opportunity Filters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm text-slate-400">Opportunity Filters</label>
            <div className="group relative">
              <svg className="w-4 h-4 text-slate-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 z-10 shadow-xl">
                These settings control which opportunities appear on your dashboard
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">Control which arbitrage opportunities are shown on your dashboard</p>
          
          <div className="space-y-4">
            {/* Minimum Profit (Dollars) */}
            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <span className="text-sm text-slate-300 font-medium">Minimum Profit (USD)</span>
                  <p className="text-xs text-slate-500 mt-1">Only show opportunities with at least this much profit after gas</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
                    value={localMinProfit}
                    onChange={(e) => handleMinProfitChange(parseFloat(e.target.value))}
                    disabled={isUpdating}
                    className={`w-24 px-3 py-1.5 bg-slate-700/50 border rounded-lg text-slate-200 text-center focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      minProfitError ? 'border-red-500 focus:ring-red-400/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
                    }`}
                  />
                </div>
              </div>
              {minProfitError && <p className="text-red-400 text-xs">{minProfitError}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-slate-500">Quick:</span>
                {[5, 10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleMinProfitChange(preset)}
                    disabled={isUpdating}
                    className={`px-2 py-0.5 text-xs rounded border transition-all disabled:opacity-50 ${
                      localMinProfit === preset
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-600/50'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Maximum Gas Cost (Dollars) */}
            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <span className="text-sm text-slate-300 font-medium">Maximum Gas Cost (USD)</span>
                  <p className="text-xs text-slate-500 mt-1">Filter out opportunities where gas fees exceed this amount</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    step="1"
                    value={localMaxGasCost}
                    onChange={(e) => handleMaxGasCostChange(parseFloat(e.target.value))}
                    disabled={isUpdating}
                    className={`w-24 px-3 py-1.5 bg-slate-700/50 border rounded-lg text-slate-200 text-center focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      maxGasCostError ? 'border-red-500 focus:ring-red-400/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
                    }`}
                  />
                </div>
              </div>
              {maxGasCostError && <p className="text-red-400 text-xs">{maxGasCostError}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-slate-500">Quick:</span>
                {[20, 50, 100, 150, 200].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleMaxGasCostChange(preset)}
                    disabled={isUpdating}
                    className={`px-2 py-0.5 text-xs rounded border transition-all disabled:opacity-50 ${
                      localMaxGasCost === preset
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-600/50'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum ROI (Percent) */}
            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <span className="text-sm text-slate-300 font-medium">Minimum ROI (%)</span>
                  <p className="text-xs text-slate-500 mt-1">Return on investment threshold (typical range: 0.1% - 5%)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={localProfitThreshold}
                    onChange={handleProfitThresholdChange}
                    onBlur={handleProfitThresholdBlur}
                    disabled={isUpdating}
                    className={`w-20 px-3 py-1.5 bg-slate-700/50 border rounded-lg text-slate-200 text-center focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      profitThresholdError ? 'border-red-500 focus:ring-red-400/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
                    }`}
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
              {profitThresholdError && <p className="text-red-400 text-xs mb-2">{profitThresholdError}</p>}
              
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={localProfitThreshold}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setLocalProfitThreshold(value);
                    validateProfitThreshold(value);
                    if (validateProfitThreshold(value)) {
                      onUpdate?.({ profitThreshold: value });
                    }
                  }}
                  disabled={isUpdating}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span>2.5%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-slate-500">Quick:</span>
                {[0.5, 1, 2, 5].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setLocalProfitThreshold(preset);
                      validateProfitThreshold(preset);
                      onUpdate?.({ profitThreshold: preset });
                    }}
                    disabled={isUpdating}
                    className={`px-2 py-0.5 text-xs rounded border transition-all disabled:opacity-50 ${
                      Math.abs(localProfitThreshold - preset) < 0.1
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-600/50'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum ML Score */}
            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <span className="text-sm text-slate-300 font-medium">Minimum ML Confidence Score</span>
                  <p className="text-xs text-slate-500 mt-1">AI prediction score (0-100) - higher means more reliable opportunity</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={localMinScore}
                    onChange={(e) => handleMinScoreChange(parseFloat(e.target.value))}
                    disabled={isUpdating}
                    className="w-20 px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localMinScore}
                  onChange={(e) => handleMinScoreChange(parseFloat(e.target.value))}
                  disabled={isUpdating}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-slate-500">Quick:</span>
                {[0, 40, 60, 80].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleMinScoreChange(preset)}
                    disabled={isUpdating}
                    className={`px-2 py-0.5 text-xs rounded border transition-all disabled:opacity-50 ${
                      localMinScore === preset
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-600/50'
                    }`}
                  >
                    {preset === 0 ? 'Any' : preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreferences;
