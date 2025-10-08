import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { useLoginForm } from '../../hooks/useLoginForm';

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    rememberMe,
    isLoading,
    setRememberMe,
    handleInputChange,
    handleSubmit,
  } = useLoginForm();

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
          <p className="text-red-400 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Login Form */}
      <form 
        onSubmit={handleSubmit} 
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
            aria-describedby={errors.email ? "email-error" : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.email}
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
            aria-describedby={errors.password ? "password-error" : undefined}
            autoComplete="current-password"
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.password}
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
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

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
            onClick={() => {/* TODO: Implement forgot password */}}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus:underline"
            aria-label="Forgot password? Click to reset"
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <p className="text-slate-400">
            New to ArbiTrader Pro?{' '}
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
