import React from 'react';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { useForgotPasswordForm } from '../../hooks/useForgotPasswordForm';

interface ForgotPasswordFormProps {
  className?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className = "" }) => {
  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    attemptCount,
    isRateLimited,
    handleInputChange,
    handleSubmit,
    handleBackToLogin,
  } = useForgotPasswordForm();

  if (isSuccess) {
    return (
      <div className={`max-w-md mx-auto w-full ${className}`}>
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-slate-400 text-lg">
            We've sent a password reset link to your email address.
          </p>
        </div>

        {/* Success Message */}
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-400 text-sm font-medium">Email Sent Successfully</p>
              <p className="text-green-300 text-sm mt-1">
                If an account with that email exists, a password reset link has been sent. Please check your inbox and follow the instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-blue-400 text-sm font-medium">Next Steps</p>
              <ul className="text-blue-300 text-sm mt-1 space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the password reset link in the email</li>
                <li>• Create a new password</li>
                <li>• Return to login with your new password</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Login Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleBackToLogin}
        >
          Back to Login
        </Button>

        {/* Resend Email Link */}
        <div className="text-center pt-4">
          <p className="text-slate-400">
            Didn't receive the email?{' '}
            <button 
              type="button"
              onClick={() => window.location.reload()} 
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors focus:outline-none focus:underline"
              aria-label="Try again with a different email"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Forgot Password?</h1>
        <p className="text-slate-400 text-lg">
          Enter your email address and we'll send you a link to reset your password.
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
              <p className="text-red-400 text-sm font-medium">Request Failed</p>
              <p className="text-red-300 text-sm mt-1">
                {typeof errors.general === 'string' ? errors.general : 'Failed to send password reset email. Please try again.'}
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

      {/* Rate Limiting Warning */}
      {isRateLimited && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-medium">Request Temporarily Locked</p>
              <p className="text-yellow-300 text-sm mt-1">
                Too many failed attempts. Please wait 5 minutes before trying again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attempt Counter */}
      {attemptCount > 0 && attemptCount < 3 && !isRateLimited && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-blue-400 text-sm font-medium">Failed Attempts</p>
              <p className="text-blue-300 text-sm mt-1">
                {attemptCount} failed attempt{attemptCount > 1 ? 's' : ''}. {3 - attemptCount} remaining before rate limit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Form */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6" 
        role="form" 
        aria-label="Forgot password form"
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
              Enter the email address associated with your account
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
          {isLoading ? 'Sending...' : isRateLimited ? 'Rate Limited' : 'Send Reset Link'}
        </Button>

        {/* Back to Login Link */}
        <div className="text-center pt-4">
          <p className="text-slate-400">
            Remember your password?{' '}
            <button 
              type="button"
              onClick={handleBackToLogin} 
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors focus:outline-none focus:underline"
              aria-label="Return to login page"
            >
              Back to Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
