// components/sections/ProfilePreferences.tsx
import { useState, useEffect } from "react";

interface ProfilePreferencesProps {
  tokensTracked: Record<string, boolean>;
  dashboardPopup: boolean;
  emailNotifications: boolean;
  profitThreshold: number;
  availableTokens?: string[];
  onUpdate?: (data: { 
    tokensTracked?: Record<string, boolean>;
    dashboardPopup?: boolean;
    emailNotifications?: boolean;
    profitThreshold?: number;
  }) => void;
  isUpdating?: boolean;
  className?: string;
}

const TokenCheckbox = ({ 
  token, 
  checked, 
  onChange, 
  disabled 
}: { 
  token: string; 
  checked: boolean; 
  onChange: () => void;
  disabled?: boolean;
}) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
    />
    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
      checked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
    }`}>
      {token}
    </span>
  </label>
);

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
  tokensTracked,
  dashboardPopup,
  emailNotifications,
  profitThreshold,
  availableTokens = [],
  onUpdate,
  isUpdating = false,
  className = ""
}) => {
  const [localTokensTracked, setLocalTokensTracked] = useState(tokensTracked);
  const [localDashboardPopup, setLocalDashboardPopup] = useState(dashboardPopup);
  const [localEmailNotifications, setLocalEmailNotifications] = useState(emailNotifications);
  const [localProfitThreshold, setLocalProfitThreshold] = useState(profitThreshold);
  const [profitThresholdError, setProfitThresholdError] = useState<string>('');

  // Update local state when props change
  useEffect(() => {
    setLocalTokensTracked(tokensTracked);
    setLocalDashboardPopup(dashboardPopup);
    setLocalEmailNotifications(emailNotifications);
    setLocalProfitThreshold(profitThreshold);
  }, [tokensTracked, dashboardPopup, emailNotifications, profitThreshold]);

  const validateProfitThreshold = (value: number): boolean => {
    if (value < 0 || value > 50) {
      setProfitThresholdError('Profit threshold must be between 0 and 50%');
      return false;
    }
    setProfitThresholdError('');
    return true;
  };

  const handleTokenToggle = (token: string) => {
    const newTokensTracked = {
      ...localTokensTracked,
      [token]: !localTokensTracked[token]
    };
    setLocalTokensTracked(newTokensTracked);
    
    // Update pending changes immediately
    onUpdate?.({ tokensTracked: newTokensTracked });
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
        {/* Tokens Tracked */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Tokens Tracked</label>
          <p className="text-xs text-slate-500 mb-3">Select which tokens to monitor for arbitrage opportunities.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableTokens.length > 0 ? (
              availableTokens.map((token) => (
                <TokenCheckbox
                  key={token}
                  token={token}
                  checked={localTokensTracked[token] || false}
                  onChange={() => handleTokenToggle(token)}
                  disabled={isUpdating}
                />
              ))
            ) : (
              Object.entries(localTokensTracked).map(([token, checked]) => (
                <TokenCheckbox
                  key={token}
                  token={token}
                  checked={checked}
                  onChange={() => handleTokenToggle(token)}
                  disabled={isUpdating}
                />
              ))
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <label className="block text-sm text-slate-400 mb-3">Notification Settings</label>
          <p className="text-xs text-slate-500 mb-4">Choose how to receive alerts (email, dashboard popup).</p>
          
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

        {/* Alert Thresholds */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Alert Thresholds</label>
          <p className="text-xs text-slate-500 mb-3">Set minimum profit percentage for notifications. Typical arbitrage opportunities range from 0.1% to 5%.</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Notify me if profit</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-cyan-400 font-medium">&gt;</span>
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
            {profitThresholdError && <p className="text-red-400 text-xs mt-1">{profitThresholdError}</p>}
            
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
                  
                  // Update pending changes immediately if valid
                  if (validateProfitThreshold(value)) {
                    onUpdate?.({ profitThreshold: value });
                  }
                }}
                onMouseUp={() => {
                  if (localProfitThreshold !== profitThreshold) {
                    onUpdate?.({ profitThreshold: localProfitThreshold });
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
            
            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-slate-500 mr-2">Quick presets:</span>
              {[0.5, 1, 2, 5].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setLocalProfitThreshold(preset);
                    validateProfitThreshold(preset);
                    onUpdate?.({ profitThreshold: preset });
                  }}
                  disabled={isUpdating}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all disabled:opacity-50 ${
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePreferences;
