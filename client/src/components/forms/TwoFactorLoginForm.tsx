// components/forms/TwoFactorLoginForm.tsx
import React, { useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button/Button';
import { TwoFactorService } from '../../services/twoFactorService';

interface TwoFactorLoginFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  onError: (error: string) => void;
}

const TwoFactorLoginForm: React.FC<TwoFactorLoginFormProps> = ({
  email,
  onSuccess,
  onBack,
  onError
}) => {
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || token.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await TwoFactorService.verifyLogin(email, token);
      // Store tokens for successful login
      localStorage.setItem('accessToken', result.accessToken);
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Verification failed');
      onError(error.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Two-Factor Authentication</h1>
        <p className="text-slate-400 text-sm">
          Enter the 6-digit code from your authenticator app
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Signing in as: <span className="text-slate-300">{email}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">Verification Failed</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Verification Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={token}
              onChange={handleTokenChange}
              placeholder="000000"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
            {token.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full ${token.length === 6 ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isVerifying}
          className="w-full"
          disabled={token.length !== 6 || isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Verify & Sign In'}
        </Button>

        {/* Back Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Lost your authenticator? Use a backup code instead
          </p>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorLoginForm;
