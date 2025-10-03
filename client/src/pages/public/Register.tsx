import React, { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/ui';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await register(name, email, password);
      navigate('/home');
    } catch (err: any) {
      let message = 'Registration failed.';
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
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join ArbiTrader and start trading</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={setName}
                required
                className="w-full"
              />
            </div>
            
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
            
            <div>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!name || !email || !password || !confirmPassword}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;