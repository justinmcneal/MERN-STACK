// components/sections/ProfileSecurity.tsx
import { useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTwoFactor } from "../../hooks/useTwoFactor";
import TwoFactorSetupModal from "../ui/TwoFactorSetupModal";
import TwoFactorDisableModal from "../ui/TwoFactorDisableModal";

interface ProfileSecurityProps {
  twoFactorAuth: boolean;
  onUpdate?: (data: { twoFactorAuth?: boolean }) => void;
  isUpdating?: boolean;
  className?: string;
}

const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  disabled,
  className = ""
}: { 
  enabled: boolean; 
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
      enabled ? 'bg-cyan-500' : 'bg-slate-600'
    } ${className}`}
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
  const [, setLocalTwoFactorAuth] = useState(twoFactorAuth);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  const {
    status,
    setupData,
    isLoading,
    isUpdating: is2FAUpdating,
    errors,
    setup,
    verifySetup,
    disable,
    regenerateBackupCodes,
    clearSetupData
  } = useTwoFactor();

  const handleTwoFactorToggle = async () => {
    if (status?.enabled) {
      setShowDisableModal(true);
    } else {
      setShowSetupModal(true);
      // Call setup API to get QR code and backup codes
      await setup();
    }
  };


  const handleVerifySetup = async (token: string) => {
    const result = await verifySetup(token);
    if (result.success) {
      setLocalTwoFactorAuth(true);
      onUpdate?.({ twoFactorAuth: true });
      setShowSetupModal(false);
      clearSetupData();
    }
    return result;
  };

  const handleDisable = async (password: string) => {
    const result = await disable(password);
    if (result.success) {
      setLocalTwoFactorAuth(false);
      onUpdate?.({ twoFactorAuth: false });
      setShowDisableModal(false);
    }
    return result;
  };

  const handleRegenerateBackupCodes = async () => {
    const result = await regenerateBackupCodes();
    if (result.success && result.codes) {
      // Show backup codes in a modal or download them
      const codesText = result.codes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arbitrage-pro-backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">
                {status?.enabled 
                  ? `Enabled on ${status.verifiedAt ? new Date(status.verifiedAt).toLocaleDateString() : 'Unknown'}`
                  : 'Enhancing account security with multi-layer authentication.'
                }
              </p>
            </div>
            <ToggleSwitch 
              enabled={status?.enabled || false}
              onChange={handleTwoFactorToggle}
              disabled={isUpdating || is2FAUpdating || isLoading}
              className="self-start sm:self-auto"
            />
          </div>
          
          {/* 2FA Status and Actions */}
          {status?.enabled && (
            <div className="space-y-3 pt-3 border-t border-slate-600/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Backup Codes:</span>
                <span className="text-slate-200">{status.backupCodesCount} remaining</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={is2FAUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500/50 rounded-lg text-xs text-slate-200 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate Codes
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {errors.general && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400">{errors.general}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TwoFactorSetupModal
        isOpen={showSetupModal}
        onClose={() => {
          setShowSetupModal(false);
          clearSetupData();
        }}
        qrCodeUrl={setupData?.qrCodeUrl || ''}
        backupCodes={setupData?.backupCodes || []}
        onVerify={handleVerifySetup}
        isVerifying={is2FAUpdating}
      />

      <TwoFactorDisableModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onDisable={handleDisable}
        isDisabling={is2FAUpdating}
      />
    </div>
  );
};

export default ProfileSecurity;
