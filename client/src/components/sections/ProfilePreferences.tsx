// components/sections/ProfilePreferences.tsx
import { useState, useEffect } from "react";

interface ProfilePreferencesProps {
  dashboardPopup: boolean;
  emailNotifications: boolean;
  onUpdate?: (data: { 
    dashboardPopup?: boolean;
    emailNotifications?: boolean;
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
  onUpdate,
  isUpdating = false,
  className = ""
}) => {
  const [localDashboardPopup, setLocalDashboardPopup] = useState(dashboardPopup);
  const [localEmailNotifications, setLocalEmailNotifications] = useState(emailNotifications);

  // Update local state when props change
  useEffect(() => {
    setLocalDashboardPopup(dashboardPopup);
    setLocalEmailNotifications(emailNotifications);
  }, [dashboardPopup, emailNotifications]);

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


      </div>
    </div>
  );
};

export default ProfilePreferences;
