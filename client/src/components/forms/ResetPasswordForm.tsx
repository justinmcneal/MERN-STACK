import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { useResetPasswordForm } from '../../hooks/useResetPasswordForm';

interface ResetPasswordFormProps {
  className?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    token,
    handleInputChange,
    handleSubmit,
    handleBackToLogin,
  } = useResetPasswordForm();

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
          <h1 className="text-3xl font-bold text-white mb-4">Password Reset Complete</h1>
          <p className="text-slate-400 text-lg">
            Your password has been successfully reset. You can now log in with your new password.
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
              <p className="text-green-400 text-sm font-medium">Password Updated Successfully</p>
              <p className="text-green-300 text-sm mt-1">
                Your account is now secured with your new password. You can log in immediately.
              </p>
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
          Continue to Login
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`max-w-md mx-auto w-full ${className}`}>
        {/* Error Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Invalid Reset Link</h1>
          <p className="text-slate-400 text-lg">
            This password reset link is invalid or has expired.
          </p>
        </div>

        {/* Error Message */}
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">Link Expired or Invalid</p>
              <p className="text-red-300 text-sm mt-1">
                Password reset links expire after 1 hour for security. Please request a new password reset.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/forgot-password')}
          >
            Request New Reset Link
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Reset Your Password</h1>
        <p className="text-slate-400 text-lg">
          Enter your new password below. Make sure it's secure and easy to remember.
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
              <p className="text-red-400 text-sm font-medium">Reset Failed</p>
              <p className="text-red-300 text-sm mt-1">
                {typeof errors.general === 'string' ? errors.general : 'Failed to reset password. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Form */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6" 
        role="form" 
        aria-label="Reset password form"
        noValidate
      >
        {/* New Password Input */}
        <div>
          <Input
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
            showPasswordToggle={true}
            aria-describedby={errors.password ? "password-error" : "password-help"}
            autoComplete="new-password"
          />
          {!errors.password && (
            <p id="password-help" className="mt-1 text-xs text-slate-500">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            required
            showPasswordToggle={true}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : "confirm-password-help"}
            autoComplete="new-password"
          />
          {!errors.confirmPassword && (
            <p id="confirm-password-help" className="mt-1 text-xs text-slate-500">
              Must match the password above
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
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordForm;
