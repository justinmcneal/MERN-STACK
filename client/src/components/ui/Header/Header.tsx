import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-50 w-full px-6 lg:px-8 py-6 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-2xl font-bold">
              <span className="text-cyan-400">Arbi</span>
              <span className="text-white">Trage</span>
              <span className="text-purple-400 ml-1">Pro</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-14 text-slate-300">
            <a className="hover:text-cyan-400 transition-colors font-medium" href="#features">Features</a>
            <a className="hover:text-cyan-400 transition-colors font-medium" href="#dashboard">Dashboard</a>
            <a className="hover:text-cyan-400 transition-colors font-medium" href="about-us">About</a>
          </nav>
        </div>

        {/* Right side (Buttons + Mobile toggle) */}
        <div className="flex items-center gap-4">
          {/* Login/Signup */}
          <div className="hidden sm:flex gap-4">
            <button 
              onClick={() => navigate("/logIn")} 
              className="px-5 py-2 border border-slate-600 hover:border-cyan-400 rounded-lg 
                        text-slate-300 hover:text-white transition-all duration-300 font-medium 
                        text-sm sm:text-base"
            >
              Login
            </button>
            <button 
              onClick={() => navigate("/signUp")} 
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 
                        hover:from-cyan-400 hover:to-purple-500 shadow-lg hover:shadow-cyan-500/25 
                        transition-all duration-300 font-semibold"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="lg:hidden text-slate-300 hover:text-cyan-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 px-4 py-3 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-xl flex flex-col gap-4 text-slate-200">
          <a href="#features" className="hover:text-cyan-400">Features</a>
          <a href="#dashboard" className="hover:text-cyan-400">Dashboard</a>
          <a href="about-us" className="hover:text-cyan-400">About</a>
          <button 
            onClick={() => navigate("/logIn")} 
            className="w-full px-4 py-2 border border-slate-600 hover:border-cyan-400 rounded-lg "
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/signUp")} 
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500"
          >
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
