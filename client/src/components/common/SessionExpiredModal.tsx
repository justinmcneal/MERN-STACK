import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    if (onClose) onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Icon Header */}
          <div className="flex items-center justify-center pt-8 pb-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-amber-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Session Expired
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Your session has expired due to inactivity. Please log in again to continue.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Log In Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
