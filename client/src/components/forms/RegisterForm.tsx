import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import TermsAgreementModal from '../ui/TermsAgreementModal/TermsAgreementModal';
import { useRegisterForm } from '../../hooks/useRegisterForm';

interface RegisterFormProps {
  className?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const {
    formData,
    errors,
    agreeToTerms,
    isLoading,
    setAgreeToTerms,
    handleInputChange,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Create an Account</h1>
        <p className="text-slate-400 text-lg">Please enter your details.</p>
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
              <p className="text-red-400 text-sm font-medium">Registration Failed</p>
              <p className="text-red-300 text-sm mt-1">
                {typeof errors.general === 'string' ? errors.general : 'Registration failed. Please try again.'}
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

      {/* Registration Form */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6" 
        role="form" 
        aria-label="Registration form"
        noValidate
      >
        {/* Name Input */}
        <div>
          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            required
            aria-describedby={errors.name ? "name-error" : "name-help"}
            autoComplete="name"
          />
          {!errors.name && (
            <p id="name-help" className="mt-1 text-xs text-slate-500">
              Enter your full legal name
            </p>
          )}
        </div>

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
            placeholder="Create your strong password"
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
              Minimum 8 characters with uppercase, lowercase, number, and special character
            </p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
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
              Re-enter your password to confirm
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
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        {/* Terms Agreement Button */}
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="w-full px-6 py-3 bg-slate-800/50 border border-slate-700/50 hover:border-cyan-400/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 font-medium text-sm"
        >
          Review & Accept Terms
        </button>

        {agreeToTerms && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-emerald-400">You have agreed to our Terms of Service and Privacy Policy</span>
          </div>
        )}

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-slate-400">
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate("/logIn")} 
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors focus:outline-none focus:underline"
              aria-label="Go to login page"
            >
              Login
            </button>
          </p>
        </div>
      </form>

      <TermsAgreementModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAgree={() => {
          setAgreeToTerms(true);
          setShowTermsModal(false);
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RegisterForm;
