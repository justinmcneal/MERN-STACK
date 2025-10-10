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
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg mx-auto max-h-[95vh] overflow-y-auto">
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

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Step 1: QR Code */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Step 1: Scan QR Code</h3>
            <p className="text-xs text-slate-400 mb-4">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
            </p>
            <div className="bg-white p-3 sm:p-4 rounded-lg flex justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 sm:w-48 sm:h-48" />
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                    <p className="text-xs sm:text-sm">Generating QR code...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Backup Codes */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Step 2: Save Backup Codes</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 sm:p-4">
              {backupCodes.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm font-mono text-slate-200">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-slate-800 rounded text-center break-all">
                      {code}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 sm:py-8 text-slate-400">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-slate-400 mx-auto mb-2"></div>
                    <p className="text-xs sm:text-sm">Generating backup codes...</p>
                  </div>
                </div>
              )}
              {backupCodes.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={copyBackupCodes}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-xs sm:text-sm text-slate-200 transition-colors"
                  >
                    {copiedCodes ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                    {copiedCodes ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-xs sm:text-sm text-slate-200 transition-colors"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Verification */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Step 3: Verify Setup</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the 6-digit code from your authenticator app to complete the setup.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setToken(value);
                    setError('');
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-center text-xl sm:text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  maxLength={6}
                />
                {token.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${token.length === 6 ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                  </div>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              <button
                onClick={handleVerify}
                disabled={token.length !== 6 || isVerifying || !qrCodeUrl || backupCodes.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors text-sm sm:text-base"
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
