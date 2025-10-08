// components/sections/ProfilePreferences.tsx

interface ProfilePreferencesProps {
  tokensTracked: Record<string, boolean>;
  dashboardPopup: boolean;
  emailNotifications: boolean;
  profitThreshold: number;
  className?: string;
}

const TokenCheckbox = ({ token, checked, onChange }: { token: string, checked: boolean, onChange: () => void }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-2 focus:ring-cyan-400/50"
    />
    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
      checked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
    }`}>
      {token}
    </span>
  </label>
);

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
  className = ""
}) => {
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
            {Object.entries(tokensTracked).map(([token, checked]) => (
              <TokenCheckbox
                key={token}
                token={token}
                checked={checked}
                onChange={() => {}}
              />
            ))}
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
                enabled={dashboardPopup}
                onChange={() => {}}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-sm text-slate-300">Email</span>
              <ToggleSwitch 
                enabled={emailNotifications}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Alert Thresholds</label>
          <p className="text-xs text-slate-500 mb-3">Set minimum profit percentage for notifications.</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Notify me if profit</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-cyan-400 font-medium">&gt;</span>
                <input
                  type="number"
                  value={profitThreshold}
                  onChange={() => {}}
                  className="w-16 px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={profitThreshold}
                onChange={() => {}}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreferences;
