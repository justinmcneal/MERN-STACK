import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { useLoginForm } from '../../hooks/useLoginForm';
import TwoFactorLoginForm from './TwoFactorLoginForm';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const {
    formData,
    errors,
    rememberMe,
    isLoading,
    isRateLimited,
    attemptCount,
    setRememberMe,
    handleInputChange,
    handleSubmit,
  } = useLoginForm();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
  await handleSubmit(e);
  // If we get here, login was successful
  navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '';

      // Check if error indicates 2FA is required
      if (errorMessage && (errorMessage.includes('2FA') || errorMessage.includes('verification required'))) {
        setUserEmail(formData.email);
        setShowTwoFactor(true);
        return; // Don't let the error propagate
      }
      // Other errors will be handled by the existing error handling
    }
  };

  const handleTwoFactorSuccess = async () => {
    console.log('🔐 [LoginForm] 2FA verification successful, updating auth state');
    try {
      // Refresh user data in auth context
      await refreshUser();
  console.log('🔐 [LoginForm] Auth state refreshed, navigating to dashboard');
      
  // Navigate to dashboard page
  navigate('/dashboard');
    } catch (error) {
      console.error('🔐 [LoginForm] Failed to refresh auth state after 2FA:', error);
      // Fallback to page reload if something goes wrong
      window.location.reload();
    }
  };

  const handleTwoFactorError = (error: string) => {
    console.error('2FA verification failed:', error);
  };

  const handleBackToLogin = () => {
    setShowTwoFactor(false);
    setUserEmail('');
  };

  // Show 2FA form if needed
  if (showTwoFactor) {
    return (
      <div className={`max-w-md mx-auto w-full ${className}`}>
        <TwoFactorLoginForm
          email={userEmail}
          onSuccess={handleTwoFactorSuccess}
          onBack={handleBackToLogin}
          onError={handleTwoFactorError}
        />
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome Back!</h1>
        <p className="text-slate-400 text-lg">
          Access your comprehensive professional monitoring dashboard for real-time insights.
        </p>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">Login Failed</p>
              <p className="text-red-300 text-sm mt-1">
                {typeof errors.general === 'string' ? errors.general : 'An unexpected error occurred. Please try again.'}
              </p>
              {errors.general && errors.general.includes('Please refresh the page') && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form 
        onSubmit={handleLoginSubmit} 
        className="space-y-6" 
        role="form" 
        aria-label="Login form"
        noValidate
      >
        {/* Email Input */}
        <div>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            required
            aria-describedby={errors.email ? "email-error" : "email-help"}
            autoComplete="email"
          />
          {!errors.email && (
            <p id="email-help" className="mt-1 text-xs text-slate-500">
              Enter your registered email address
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
            showPasswordToggle={true}
            aria-describedby={errors.password ? "password-error" : "password-help"}
            autoComplete="current-password"
          />
          {!errors.password && (
            <p id="password-help" className="mt-1 text-xs text-slate-500">
              Minimum 6 characters, no spaces allowed
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
          disabled={isLoading || isRateLimited}
        >
          {isLoading ? 'Signing In...' : isRateLimited ? 'Rate Limited' : 'Sign In'}
        </Button>

        {/* Rate Limiting Warning */}
        {isRateLimited && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-yellow-400 text-sm font-medium">Account Temporarily Locked</p>
                <p className="text-yellow-300 text-sm mt-1">
                  Too many failed attempts. Please wait 5 minutes before trying again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Attempt Counter */}
        {attemptCount > 0 && attemptCount < 5 && !isRateLimited && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-400 text-sm font-medium">Failed Attempts</p>
                <p className="text-blue-300 text-sm mt-1">
                  {attemptCount} failed attempt{attemptCount > 1 ? 's' : ''}. {5 - attemptCount} remaining before rate limit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50 text-cyan-500"
              aria-describedby="remember-me-description"
            />
            <span className="text-sm text-slate-300" id="remember-me-description">
              Remember Me
            </span>
          </label>
          <button 
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus:underline"
            aria-label="Forgot password? Click to reset"
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <p className="text-slate-400">
            New to Arbitrage Pro?{' '}
            <button 
              type="button"
              onClick={() => navigate("/signUp")} 
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors focus:outline-none focus:underline"
              aria-label="Create a new account"
            >
              Create an account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
