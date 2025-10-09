// components/sections/VerifyEmailHeader.tsx
import React from 'react';
import { Mail } from 'lucide-react';

interface VerifyEmailHeaderProps {
  className?: string;
}

const VerifyEmailHeader: React.FC<VerifyEmailHeaderProps> = ({ className = "" }) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
        <Mail className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Email Verification</h1>
      <p className="text-slate-400">Verify your email address to complete registration</p>
    </div>
  );
};

export default VerifyEmailHeader;
