// pages/VerifyEmail.tsx
import React from 'react';
import VerifyEmailHeader from '../components/sections/VerifyEmailHeader';
import VerifyEmailForm from '../components/forms/VerifyEmailForm';

const VerifyEmail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/10"></div>
      
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          {/* Header */}
          <VerifyEmailHeader />

          {/* Verification Form */}
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
