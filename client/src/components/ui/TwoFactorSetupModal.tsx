// components/ui/TwoFactorSetupModal.tsx
import React, { useState } from 'react';
import { X, Shield, Download, Copy, Check } from 'lucide-react';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  backupCodes: string[];
  onVerify: (token: string) => Promise<{ success: boolean; error?: string }>;
  isVerifying: boolean;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  qrCodeUrl,
  backupCodes,
  onVerify,
  isVerifying
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setError('');
    const result = await onVerify(token);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Verification failed');
    }
  };

  const copyBackupCodes = async () => {
    const codesText = backupCodes.join('\n');
    try {
      await navigator.clipboard.writeText(codesText);
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch (err) {
      console.error('Failed to copy backup codes:', err);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arbitrage-pro-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-200">Setup Two-Factor Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: QR Code */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Step 1: Scan QR Code</h3>
            <p className="text-xs text-slate-400 mb-4">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
            </p>
            <div className="bg-white p-4 rounded-lg flex justify-center">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          </div>

          {/* Step 2: Backup Codes */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Step 2: Save Backup Codes</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono text-slate-200">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-slate-800 rounded text-center">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={copyBackupCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm text-slate-200 transition-colors"
                >
                  {copiedCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCodes ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm text-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Verification */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Step 3: Verify Setup</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the 6-digit code from your authenticator app to complete the setup.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setToken(value);
                  setError('');
                }}
                placeholder="000000"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                maxLength={6}
              />
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <button
                onClick={handleVerify}
                disabled={token.length !== 6 || isVerifying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetupModal;
