// components/sections/ProfileSecurity.tsx
import { useState } from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileSecurityProps {
  twoFactorAuth: boolean;
  onUpdate?: (data: { twoFactorAuth?: boolean }) => void;
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

const ProfileSecurity: React.FC<ProfileSecurityProps> = ({
  twoFactorAuth,
  onUpdate,
  isUpdating = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const [localTwoFactorAuth, setLocalTwoFactorAuth] = useState(twoFactorAuth);

  const handleTwoFactorToggle = () => {
    const newValue = !localTwoFactorAuth;
    setLocalTwoFactorAuth(newValue);
    
    // Update pending changes immediately
    onUpdate?.({ twoFactorAuth: newValue });
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Security</h2>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Change Password</h3>
              <p className="text-xs text-slate-400">Select which tokens to monitor for arbitrage opportunities.</p>
            </div>
            <button 
              onClick={() => navigate("/change-password")} 
              disabled={isUpdating}
              className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500/50 rounded-lg text-sm text-slate-200 transition-all disabled:opacity-50"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">Enhancing account security with multi-layer authentication.</p>
            </div>
            <ToggleSwitch 
              enabled={localTwoFactorAuth}
              onChange={handleTwoFactorToggle}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurity;
