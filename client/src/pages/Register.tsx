import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input/Input';
import Button from '../components/ui/Button/Button';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.general = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Registration successful, user:', user, 'navigating to dashboard');
      // Redirect to dashboard on successful registration
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({
        general: error.message || 'Registration failed. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/10"></div>
      
      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Panel - Branding */}
        <div className="flex flex-col justify-center p-8 lg:p-16 mb-80">
          {/* Back Button */}
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-56 group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Logo and Title */}
          <div className="mb-12 ml-28">
            <div className="text-4xl lg:text-6xl font-bold mb-4">
              <span className="text-cyan-400">ArbiTrage</span>
              <span className="text-purple-400 ml-2">Pro</span>
            </div>
            <p className="text-xl text-slate-300 font-light">
              Cross-Chain Arbitrage Insights Platform
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-6 ml-28">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-lg">Monitor token prices across multiple blockchains.</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-lg">Detect profitable arbitrage opportunities in real-time.</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-lg">Leverage ML-powered scoring for smarter decisions.</span>
            </div>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5
            bg-gradient-to-b from-transparent via-slate-700 to-transparent 
            transform -translate-x-1/2
            shadow-lg
            "></div>

        {/* Right Panel - Registration Form */}
        <div className="flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-md mx-auto w-full">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-4">Create an Account</h1>
              <p className="text-slate-400 text-lg">Please enter your details.</p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  label="Password"
                  placeholder="Create your strong password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Sign Up
              </Button>

              {/* Terms of Service and Privacy Policy */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50 text-cyan-500 mt-1"
                />
                <span className="text-sm text-slate-300">
                  I agree to the{" "}
                  <span className="text-cyan-400 cursor-pointer hover:underline">Terms of Service</span> and{" "}
                  <span className="text-cyan-400 cursor-pointer hover:underline">Privacy Policy</span>
                </span>
              </div>

              {/* Subscribe to trading */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subscribeToUpdates}
                  onChange={(e) => setSubscribeToUpdates(e.target.checked)}
                  className="w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50 text-cyan-500"
                />
                <span className="text-sm text-slate-300">Subscribe to trading insights and updates</span>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-slate-400">
                  Already have an account?{' '}
                  <a
                    onClick={() => navigate("/logIn")}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors cursor-pointer"
                  >
                    Login
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}