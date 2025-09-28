import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ArbiTraderLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
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
          <button onClick={() => navigate("/landing_page")} className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-56 group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Logo and Title */}
          <div className="mb-12 ml-28">
            <div className="text-4xl lg:text-6xl font-bold mb-4">
              <span className="text-cyan-400">ArbiTrader</span>
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


        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-md mx-auto w-full">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-4">Welcome Back!</h1>
              <p className="text-slate-400 text-lg">Access your trading insights dashboard.</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                    </div>
                    ) : (
                    "Sign In"
                    )}
                </button>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50 text-cyan-500"
                  />
                  <span className="text-sm text-slate-300">Remember Me</span>
                </label>
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot Password?
                </a>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-slate-400">
                  New to ArbiTrader Pro?{' '}
                  <a onClick={() => navigate("/signUp")} className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors cursor-pointer">
                    Create an account
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