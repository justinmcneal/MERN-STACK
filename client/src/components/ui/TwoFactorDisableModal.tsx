// components/ui/TwoFactorDisableModal.tsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface TwoFactorDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisable: (password: string) => Promise<{ success: boolean; error?: string }>;
  isDisabling: boolean;
}

const TwoFactorDisableModal: React.FC<TwoFactorDisableModalProps> = ({
  isOpen,
  onClose,
  onDisable,
  isDisabling
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDisable = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setError('');
    const result = await onDisable(password);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to disable two-factor authentication');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-200">Disable Two-Factor Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-400 mb-1">Security Warning</h3>
                <p className="text-xs text-red-300">
                  Disabling two-factor authentication will reduce your account security. 
                  Make sure you understand the risks before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Enter your password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDisable}
              disabled={!password || isDisabling}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors"
            >
              {isDisabling ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorDisableModal;
