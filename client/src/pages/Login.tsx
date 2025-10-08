import React from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";

export default function ArbiTraderLogin() {
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Static form submission - no actual login processing
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


        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-md mx-auto w-full">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-4">Welcome Back!</h1>
              <p className="text-slate-400 text-lg">Access your comprehensive professional monitoring dashboard for real-time insights.</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-6">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value=""
                onChange={() => {}}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value=""
                onChange={() => {}}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={false}
                className="w-full"
              >
                Sign In
              </Button>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => {}}
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
                  <a onClick={() => navigate("/register")} className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors cursor-pointer">
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