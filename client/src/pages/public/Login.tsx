import React, { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/ui';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const googleLogin = () => {window.location.href = "http://localhost:5001/api/auth/google"; };
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      let message = 'Login failed.';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      else if (typeof err === 'string') message = err;
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/10"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <Card variant="glass" padding="lg" className="backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your ArbiTrader account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={setEmail}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={setPassword}
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!email || !password}
            >
              Sign In
            </Button>
          </form>

          {/* Google Login */}
          <div className="mt-6">
            <Button
              onClick={googleLogin}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;