// components/forms/VerifyEmailForm.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, RefreshCw, Send } from 'lucide-react';
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
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-slate-300">{message}</p>
          </div>
        )}

        {status === 'verified' && (
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

        {status === 'pending' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-cyan-400">Check your inbox</h2>
              <p className="text-slate-300">{message}</p>
              {email && (
                <p className="text-sm text-slate-400">
                  We sent an email to <span className="text-white font-semibold">{email}</span>. If it hasn’t arrived after a few minutes, try resending or check your spam folder.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  required
                  aria-describedby="pending-email-help"
                />
                <p id="pending-email-help" className="mt-1 text-xs text-slate-500">
                  Need a new link? Update your email if necessary and resend the verification email.
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

        {status === 'resent' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Send className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cyan-400 mb-2">Verification Email Sent</h2>
              <p className="text-slate-300 mb-4">{message}</p>
              <p className="text-sm text-slate-400">Check your inbox for the latest verification link.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Create a New Account
              </Button>
            </div>
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
