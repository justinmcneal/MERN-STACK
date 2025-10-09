// components/forms/VerifyEmailForm.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { useVerifyEmailForm } from '../../hooks/useVerifyEmailForm';

interface VerifyEmailFormProps {
  className?: string;
}

const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const {
    status,
    message,
    email,
    setEmail,
    resendVerification,
    isLoading,
  } = useVerifyEmailForm();

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      {/* Status Display */}
      <div className="text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-slate-300">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-400 mb-2">Email Verified!</h2>
              <p className="text-slate-300 mb-4">{message}</p>
              <p className="text-sm text-slate-400">Redirecting to login in 3 seconds...</p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-2">Verification Failed</h2>
              <p className="text-slate-300 mb-6">{message}</p>
            </div>

            {/* Resend Verification */}
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  required
                  aria-describedby="email-help"
                />
                <p id="email-help" className="mt-1 text-xs text-slate-500">
                  Enter the email address you used to register
                </p>
              </div>
              
              <Button
                onClick={resendVerification}
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailForm;
