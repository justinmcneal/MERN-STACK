// pages/VerifyEmail.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resending'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setStatus('resending');
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const isResending = status === 'resending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email Verification</h1>
            <p className="text-slate-400">Verify your email address to complete registration</p>
          </div>

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
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Go to Login
                </button>
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
                    <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    />
                  </div>
                  
                  <button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResending ? (
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
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
