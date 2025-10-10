import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePasswordForm } from '../../hooks/useChangePasswordForm';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { BackButton } from '../ui/BackButton/BackButton';

interface ChangePasswordFormProps {
  className?: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    attemptCount,
    isRateLimited,
    handleInputChange,
    handleSubmit,
    handleBackToProfile,
  } = useChangePasswordForm();

  if (isSuccess) {
    return (
      <div className={`max-w-md mx-auto w-full ${className}`}>
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Password Changed Successfully!</h1>
          <p className="text-slate-400 text-lg">
            Your password has been updated. You can now use your new password to sign in.
          </p>
        </div>

        {/* Success Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleBackToProfile}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Change Password</h1>
        <p className="text-slate-400 text-lg">
          Update your account password to keep your account secure.
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
              <p className="text-red-400 text-sm font-medium">Change Failed</p>
              <p className="text-red-300 text-sm mt-1">
                {typeof errors.general === 'string' ? errors.general : 'Failed to change password. Please try again.'}
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
              <p className="text-yellow-400 text-sm font-medium">Change Temporarily Locked</p>
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

      {/* Change Password Form */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6" 
        noValidate
      >
        {/* Current Password Input */}
        <div>
          <Input
            type="password"
            label="Current Password"
            value={formData.currentPassword}
            onChange={handleInputChange('currentPassword')}
            placeholder="Enter your current password"
            error={errors.currentPassword}
            required
            showPasswordToggle={true}
            aria-describedby={errors.currentPassword ? "current-password-error" : "current-password-help"}
            autoComplete="current-password"
          />
          {!errors.currentPassword && (
            <p id="current-password-help" className="mt-1 text-xs text-slate-500">
              Enter your current password to verify your identity
            </p>
          )}
        </div>

        {/* New Password Input */}
        <div>
          <Input
            type="password"
            label="New Password"
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            placeholder="Enter your new password"
            error={errors.newPassword}
            required
            showPasswordToggle={true}
            aria-describedby={errors.newPassword ? "new-password-error" : "new-password-help"}
            autoComplete="new-password"
          />
          {!errors.newPassword && formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500">Password strength:</span>
                <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      formData.newPassword.length < 8 ? 'bg-red-500 w-1/4' :
                      formData.newPassword.length < 12 ? 'bg-yellow-500 w-1/2' :
                      formData.newPassword.length < 16 ? 'bg-blue-500 w-3/4' :
                      'bg-green-500 w-full'
                    }`}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${
                  formData.newPassword.length < 8 ? 'text-red-400' :
                  formData.newPassword.length < 12 ? 'text-yellow-400' :
                  formData.newPassword.length < 16 ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {formData.newPassword.length < 8 ? 'Weak' :
                   formData.newPassword.length < 12 ? 'Fair' :
                   formData.newPassword.length < 16 ? 'Good' :
                   'Strong'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <Input
            type="password"
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirm your new password"
            error={errors.confirmPassword}
            required
            showPasswordToggle={true}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : "confirm-password-help"}
            autoComplete="new-password"
          />
          {!errors.confirmPassword && formData.confirmPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  formData.confirmPassword === formData.newPassword ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-xs font-medium ${
                  formData.confirmPassword === formData.newPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formData.confirmPassword === formData.newPassword ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Must match the new password above
              </p>
            </div>
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
          {isLoading ? 'Changing...' : isRateLimited ? 'Rate Limited' : 'Change Password'}
        </Button>

        {/* Back to Profile Link */}
        <div className="text-center pt-4">
          <BackButton 
            onClick={handleBackToProfile}
            className="text-slate-400 hover:text-cyan-400"
          >
            Back to Profile
          </BackButton>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
