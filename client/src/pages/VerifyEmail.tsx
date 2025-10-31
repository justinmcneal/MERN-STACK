// pages/VerifyEmail.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VerifyEmailHeader from '../components/sections/VerifyEmailHeader';
import VerifyEmailForm from '../components/forms/VerifyEmailForm';
import VerifyEmailLayout from '../components/sections/VerifyEmailLayout';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <VerifyEmailLayout>
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          <button
            onClick={() => navigate('/login')}
            className="mb-6 inline-flex items-center text-xs font-semibold uppercase tracking-wide text-slate-300 hover:text-white"
          >
            ← Back to login
          </button>
          <VerifyEmailHeader />
          <VerifyEmailForm />
        </div>
      </div>
    </VerifyEmailLayout>
  );
};

export default VerifyEmail;
